using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

/* What every kind of work item shares. Each type is a subclass with its own fields — UserStory,
   TicketTask, Bug, Fix — mapped table-per-type (TPT): this class is the Tickets table and each
   subclass has its own table whose primary key is also a foreign key to Tickets.Id.

   Why TPT: almost every read mixes types (lists, board, epic and sprint progress), and Tickets is
   the one table anything can point at with a real foreign key: ParentId today, comments or
   attachments later. Each type still gets real columns, so the database and the compiler know
   which fields a bug has. Abstract, so EF never creates a "plain" ticket. */
public abstract class Ticket
{
    [Key]
    public int Id { get; set; }

    // Set by the service from the route, never from the body. Same value as the epic's project.
    public int ProjectId { get; set; }

    // The position in this project's sequence for this type (ENT-4). With the project key and
    // the type it builds Code. Assigned once, never reused.
    public int Number { get; set; }

    // {KEY}-{TYPE}-{N}, e.g. R2T-UH-12. Assigned once on create, never accepted from the client.
    [Required]
    [StringLength(WorkItemCode.MaxLength)]
    public string Code { get; set; } = string.Empty;

    // Kept as a column even though the subclass already says it: lists filter by type without
    // joining four tables. Each subclass sets it in its constructor and nothing else writes it,
    // because the code carries the type's prefix — converting a bug into a task means a new ticket.
    public TicketType Type { get; protected set; }

    [Required]
    [StringLength(160, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    // A ticket always belongs to an epic of its own project.
    public int EpicId { get; set; }

    public Epic? Epic { get; set; }

    public TicketPriority Priority { get; set; } = TicketPriority.Medium;

    // Only TicketService.ChangeStatusAsync changes this after create, so the workflow and the
    // completion rules are checked in one place.
    public TicketStatus Status { get; set; } = TicketStatus.Todo;

    public int? AssigneeId { get; set; }

    public User? Assignee { get; set; }

    // Whoever created it, taken from the token. Only goes null once that user is deleted.
    public int? ReporterId { get; set; }

    public User? Reporter { get; set; }

    // Null is the backlog, not missing data: deleting a sprint sends its tickets back there.
    public int? SprintId { get; set; }

    public Sprint? Sprint { get; set; }

    // "Se divide en": a story into tasks and bugs, a bug into fixes. Which type may hang from
    // which is TicketService.AllowedParentTypes; following any legal chain ends at a story, so
    // there are no cycles to guard against.
    public int? ParentId { get; set; }

    public Ticket? Parent { get; set; }

    // DateTimeOffset, stored as timestamptz in UTC. Keep writing UtcNow: Npgsql refuses offsets.
    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}

// UserStory is "historia de usuario" (UH) in the UI.
[JsonConverter(typeof(StringOnlyEnumConverter<TicketType>))]
public enum TicketType
{
    [JsonStringEnumMemberName("userStory")]
    UserStory,

    [JsonStringEnumMemberName("task")]
    Task,

    [JsonStringEnumMemberName("bug")]
    Bug,

    [JsonStringEnumMemberName("fix")]
    Fix
}

[JsonConverter(typeof(StringOnlyEnumConverter<TicketPriority>))]
public enum TicketPriority
{
    [JsonStringEnumMemberName("low")]
    Low,

    [JsonStringEnumMemberName("medium")]
    Medium,

    [JsonStringEnumMemberName("high")]
    High,

    [JsonStringEnumMemberName("critical")]
    Critical
}

/* Declared in workflow order, which is also the board's column order. Stored as INTEGER, so
   slipping a member into the middle renumbers every one after it and silently reinterprets
   existing rows: adding one needs a data migration. `backlog` used to be the first member;
   it was removed because being in the backlog means having no sprint, not a status. */
[JsonConverter(typeof(StringOnlyEnumConverter<TicketStatus>))]
public enum TicketStatus
{
    [JsonStringEnumMemberName("todo")]
    Todo,

    [JsonStringEnumMemberName("inProgress")]
    InProgress,

    [JsonStringEnumMemberName("inReview")]
    InReview,

    [JsonStringEnumMemberName("testing")]
    Testing,

    [JsonStringEnumMemberName("done")]
    Done,

    // Closed without being completed. It counts as neither done nor open, so it never drags a
    // sprint's or an epic's percentage down.
    [JsonStringEnumMemberName("cancelled")]
    Cancelled
}

// Severity is not priority: severity is how badly it breaks, priority how soon we look at it.
[JsonConverter(typeof(StringOnlyEnumConverter<BugSeverity>))]
public enum BugSeverity
{
    [JsonStringEnumMemberName("blocker")]
    Blocker,

    [JsonStringEnumMemberName("major")]
    Major,

    [JsonStringEnumMemberName("minor")]
    Minor,

    [JsonStringEnumMemberName("trivial")]
    Trivial
}

// How likely the fix is to break something else.
[JsonConverter(typeof(StringOnlyEnumConverter<RegressionRisk>))]
public enum RegressionRisk
{
    [JsonStringEnumMemberName("low")]
    Low,

    [JsonStringEnumMemberName("medium")]
    Medium,

    [JsonStringEnumMemberName("high")]
    High
}
