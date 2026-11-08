using System.ComponentModel.DataAnnotations;
using Domain.Common;
using Domain.Entities;
using Domain.ReadModels;
using Domain.ValueObjects;
using System.Text.Json.Serialization;
using Application.Services;

namespace Web.DTOs;

/* The shape of a ticket on the wire (ENT-2). One endpoint for the four types: the common fields at
   the top, and the type's own fields in an object named after the type.

     { "type": "bug", "title": "El login no redirige", "epicId": 4,
       "bug": { "severity": "major", "stepsToReproduce": "1. Ir a /login…" } }

   Only the object of the ticket's type is accepted: sending "task" on a bug is a 400, and so is any
   key the API does not know (UnmappedMemberHandling.Disallow in Program.cs).

   No status and no reporter: a ticket is born in todo, changes status only through PATCH …/status,
   and its reporter is whoever is logged in. Sending either is an unknown property, so a 400. */
public record TicketWriteRequest : IValidatableObject
{
    // Required on update too: the service refuses it if it is not the ticket's own type, rather
    // than converting a bug into a task.
    [Required(ErrorMessage = "Type is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<TicketType>))]
    [EnumDataType(typeof(TicketType), ErrorMessage = "Type is not valid.")]
    public TicketType? Type { get; init; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(160, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 160 characters.")]
    public string Title { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description can't be longer than 2000 characters.")]
    public string? Description { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Epic is required.")]
    public int EpicId { get; init; }

    [JsonConverter(typeof(StringOnlyEnumConverter<TicketPriority>))]
    [EnumDataType(typeof(TicketPriority), ErrorMessage = "Priority is not valid.")]
    public TicketPriority? Priority { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Assignee is not valid.")]
    public int? AssigneeId { get; init; }

    // Null leaves the ticket in the backlog.
    [Range(1, int.MaxValue, ErrorMessage = "Sprint is not valid.")]
    public int? SprintId { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Parent is not valid.")]
    public int? ParentId { get; init; }

    public UserStoryFieldsRequest? UserStory { get; init; }

    // "task" on the wire. The property is not called Task so it never shadows System.Threading.Tasks.Task.
    [JsonPropertyName("task")]
    public TaskFieldsRequest? TaskFields { get; init; }

    public BugFieldsRequest? Bug { get; init; }

    public FixFieldsRequest? Fix { get; init; }

    // The rule DataAnnotations cannot express: which of the four objects may come, depending on Type.
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Type is not TicketType type)
        {
            yield break;
        }

        (string Name, object? Value)[] objects =
        [
            ("userStory", UserStory),
            ("task", TaskFields),
            ("bug", Bug),
            ("fix", Fix)
        ];

        string own = EnumNames.Of(type);
        foreach ((string name, object? value) in objects)
        {
            if (value is not null && name != own)
            {
                yield return new ValidationResult(
                    $"Only the \"{own}\" object is allowed for a {own} ticket.",
                    [name]);
            }
        }

        // A bug cannot exist without its steps, so its object is not optional.
        if (type == TicketType.Bug && Bug is null)
        {
            yield return new ValidationResult("Steps to reproduce are required.", ["bug.stepsToReproduce"]);
        }
    }

    // Manual mapping: AutoMapper is not installed. The lists arrive as requests and leave as values.
    public Ticket ToEntity()
    {
        Ticket ticket = Type switch
        {
            TicketType.UserStory => new UserStory
            {
                Points = UserStory?.Points,
                AcceptanceCriteria = ChecklistItemRequest.ToItems(UserStory?.AcceptanceCriteria),
                DefinitionOfReady = ChecklistItemRequest.ToItems(UserStory?.DefinitionOfReady),
                DefinitionOfDone = ChecklistItemRequest.ToItems(UserStory?.DefinitionOfDone)
            },
            TicketType.Task => new TicketTask
            {
                Points = TaskFields?.Points,
                Checklist = ChecklistItemRequest.ToItems(TaskFields?.Checklist)
            },
            TicketType.Bug => new Bug
            {
                Severity = Bug?.Severity ?? BugSeverity.Minor,
                StepsToReproduce = Bug?.StepsToReproduce.Trim() ?? string.Empty,
                ExpectedResult = Blank(Bug?.ExpectedResult),
                ActualResult = Blank(Bug?.ActualResult),
                Environment = Blank(Bug?.Environment)
            },
            TicketType.Fix => new Fix
            {
                RootCause = Blank(Fix?.RootCause),
                Solution = Blank(Fix?.Solution),
                RegressionRisk = Fix?.RegressionRisk ?? RegressionRisk.Low,
                VerificationSteps = ChecklistItemRequest.ToItems(Fix?.VerificationSteps)
            },
            _ => throw new ArgumentException("Type is not valid.")
        };

        ticket.Title = Title.Trim();
        ticket.Description = Blank(Description);
        ticket.EpicId = EpicId;
        ticket.Priority = Priority ?? TicketPriority.Medium;
        ticket.AssigneeId = AssigneeId;
        ticket.SprintId = SprintId;
        ticket.ParentId = ParentId;
        return ticket;
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public record UserStoryFieldsRequest
{
    // Null means "not estimated yet", which is not 0.
    [Range(0, 100, ErrorMessage = "Points must be between 0 and 100.")]
    public int? Points { get; init; }

    [MaxLength(ChecklistItem.MaxItemsPerList, ErrorMessage = "A list can have at most 30 items.")]
    public List<ChecklistItemRequest>? AcceptanceCriteria { get; init; }

    [MaxLength(ChecklistItem.MaxItemsPerList, ErrorMessage = "A list can have at most 30 items.")]
    public List<ChecklistItemRequest>? DefinitionOfReady { get; init; }

    [MaxLength(ChecklistItem.MaxItemsPerList, ErrorMessage = "A list can have at most 30 items.")]
    public List<ChecklistItemRequest>? DefinitionOfDone { get; init; }
}

public record TaskFieldsRequest
{
    [Range(0, 100, ErrorMessage = "Points must be between 0 and 100.")]
    public int? Points { get; init; }

    [MaxLength(ChecklistItem.MaxItemsPerList, ErrorMessage = "A list can have at most 30 items.")]
    public List<ChecklistItemRequest>? Checklist { get; init; }
}

public record BugFieldsRequest
{
    // Minor when absent.
    [JsonConverter(typeof(StringOnlyEnumConverter<BugSeverity>))]
    [EnumDataType(typeof(BugSeverity), ErrorMessage = "Severity is not valid.")]
    public BugSeverity? Severity { get; init; }

    [Required(ErrorMessage = "Steps to reproduce are required.")]
    [StringLength(2000, MinimumLength = 1, ErrorMessage = "Steps to reproduce can't be longer than 2000 characters.")]
    public string StepsToReproduce { get; init; } = string.Empty;

    [StringLength(1000, ErrorMessage = "Expected result can't be longer than 1000 characters.")]
    public string? ExpectedResult { get; init; }

    [StringLength(1000, ErrorMessage = "Actual result can't be longer than 1000 characters.")]
    public string? ActualResult { get; init; }

    [StringLength(200, ErrorMessage = "Environment can't be longer than 200 characters.")]
    public string? Environment { get; init; }
}

public record FixFieldsRequest
{
    [StringLength(2000, ErrorMessage = "Root cause can't be longer than 2000 characters.")]
    public string? RootCause { get; init; }

    [StringLength(2000, ErrorMessage = "Solution can't be longer than 2000 characters.")]
    public string? Solution { get; init; }

    // Low when absent.
    [JsonConverter(typeof(StringOnlyEnumConverter<RegressionRisk>))]
    [EnumDataType(typeof(RegressionRisk), ErrorMessage = "Regression risk is not valid.")]
    public RegressionRisk? RegressionRisk { get; init; }

    [MaxLength(ChecklistItem.MaxItemsPerList, ErrorMessage = "A list can have at most 30 items.")]
    public List<ChecklistItemRequest>? VerificationSteps { get; init; }
}

public record ChecklistItemRequest
{
    [Required(ErrorMessage = "Item text is required.")]
    [StringLength(ChecklistItem.MaxTextLength, MinimumLength = 1, ErrorMessage = "Item text must be between 1 and 300 characters.")]
    public string Text { get; init; } = string.Empty;

    public bool Done { get; init; }

    public static List<ChecklistItem> ToItems(List<ChecklistItemRequest>? items) =>
        items?.Select(item => new ChecklistItem { Text = item.Text.Trim(), Done = item.Done }).ToList() ?? [];
}

public record TicketStatusRequest
{
    [Required(ErrorMessage = "Status is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<TicketStatus>))]
    [EnumDataType(typeof(TicketStatus), ErrorMessage = "Status is not valid.")]
    public TicketStatus? Status { get; init; }
}

// The type objects of the response mirror the request ones. Exactly one is not null.
public record UserStoryFields(int? Points, List<ChecklistItem> AcceptanceCriteria, List<ChecklistItem> DefinitionOfReady, List<ChecklistItem> DefinitionOfDone);

public record TaskFields(int? Points, List<ChecklistItem> Checklist);

public record BugFields(BugSeverity Severity, string StepsToReproduce, string? ExpectedResult, string? ActualResult, string? Environment);

public record FixFields(string? RootCause, string? Solution, RegressionRisk RegressionRisk, List<ChecklistItem> VerificationSteps);

/* Everything the detail shows. Relations are flattened into names so the navigation graph is never
   serialized. DescendantCount is what deleting it would take along (the confirmation says it). */
public record TicketDetailResponse(
    int Id,
    string Code,
    TicketType Type,
    string Title,
    string? Description,
    int EpicId,
    string? EpicCode,
    string? EpicName,
    EpicStatus? EpicStatus,
    TicketPriority Priority,
    TicketStatus Status,
    int? AssigneeId,
    string? AssigneeName,
    int? ReporterId,
    string? ReporterName,
    int? SprintId,
    string? SprintName,
    int? ParentId,
    string? ParentCode,
    string? ParentTitle,
    UserStoryFields? UserStory,
    [property: JsonPropertyName("task")] TaskFields? TaskFields,
    BugFields? Bug,
    FixFields? Fix,
    List<TicketRef> Children,
    int OpenChildrenCount,
    int DescendantCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static TicketDetailResponse From(TicketDetailView view)
    {
        Ticket ticket = view.Ticket;

        return new TicketDetailResponse(
            ticket.Id,
            ticket.Code,
            ticket.Type,
            ticket.Title,
            ticket.Description,
            ticket.EpicId,
            ticket.Epic?.Code,
            ticket.Epic?.Name,
            ticket.Epic?.Status,
            ticket.Priority,
            ticket.Status,
            ticket.AssigneeId,
            ticket.Assignee?.Name,
            ticket.ReporterId,
            ticket.Reporter?.Name,
            ticket.SprintId,
            ticket.Sprint?.Name,
            ticket.ParentId,
            ticket.Parent?.Code,
            ticket.Parent?.Title,
            ticket is UserStory story
                ? new UserStoryFields(story.Points, story.AcceptanceCriteria, story.DefinitionOfReady, story.DefinitionOfDone)
                : null,
            ticket is TicketTask task ? new TaskFields(task.Points, task.Checklist) : null,
            ticket is Bug bug
                ? new BugFields(bug.Severity, bug.StepsToReproduce, bug.ExpectedResult, bug.ActualResult, bug.Environment)
                : null,
            ticket is Fix fix ? new FixFields(fix.RootCause, fix.Solution, fix.RegressionRisk, fix.VerificationSteps) : null,
            view.Children,
            view.OpenChildrenCount,
            view.DescendantCount,
            ticket.CreatedAt,
            ticket.UpdatedAt);
    }
}
