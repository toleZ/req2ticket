using System.ComponentModel.DataAnnotations;
using Domain.Common;
using Domain.Entities;
using Domain.ReadModels;
using System.Text.Json.Serialization;

namespace Web.DTOs;

// Epics and sprints. Lists return the read models (EpicSummary, SprintSummary) as they are.

// Create and update share one shape. Code, number and project are never accepted.
public record EpicWriteRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 120 characters.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description can't be longer than 2000 characters.")]
    public string? Description { get; init; }

    [JsonConverter(typeof(StringOnlyEnumConverter<EpicAccentColor>))]
    [EnumDataType(typeof(EpicAccentColor), ErrorMessage = "Color is not valid.")]
    public EpicAccentColor? AccentColor { get; init; }

    [JsonConverter(typeof(StringOnlyEnumConverter<EpicPriority>))]
    [EnumDataType(typeof(EpicPriority), ErrorMessage = "Priority is not valid.")]
    public EpicPriority? Priority { get; init; }

    [JsonConverter(typeof(StringOnlyEnumConverter<EpicStatus>))]
    [EnumDataType(typeof(EpicStatus), ErrorMessage = "Status is not valid.")]
    public EpicStatus? Status { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Owner is not valid.")]
    public int? OwnerId { get; init; }

    public Epic ToEntity() => new()
    {
        Name = Name.Trim(),
        Description = string.IsNullOrWhiteSpace(Description) ? null : Description,
        AccentColor = AccentColor,
        Priority = Priority ?? EpicPriority.Medium,
        Status = Status ?? EpicStatus.Backlog,
        OwnerId = OwnerId
    };
}

// The summary's counts plus what only the detail shows.
public record EpicDetailResponse(
    int Id,
    string Code,
    string Name,
    string? Description,
    EpicAccentColor? AccentColor,
    EpicPriority Priority,
    EpicStatus Status,
    int? OwnerId,
    string? OwnerName,
    int TicketCount,
    int OpenTicketsCount,
    int DoneTicketsCount)
{
    public static EpicDetailResponse From(Epic epic, EpicSummary summary) => new(
        epic.Id,
        epic.Code,
        epic.Name,
        epic.Description,
        epic.AccentColor,
        epic.Priority,
        epic.Status,
        epic.OwnerId,
        epic.Owner?.Name,
        summary.TicketCount,
        summary.OpenTicketsCount,
        summary.DoneTicketsCount);
}

// No status: a sprint moves through /start and /complete, never through its data (ENT-5).
public record SprintWriteRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 120 characters.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(500, ErrorMessage = "Goal can't be longer than 500 characters.")]
    public string? Goal { get; init; }

    [Required(ErrorMessage = "Start date is required.")]
    public DateOnly? StartDate { get; init; }

    [Required(ErrorMessage = "End date is required.")]
    public DateOnly? EndDate { get; init; }

    [Range(0, 999, ErrorMessage = "Capacity must be between 0 and 999.")]
    public int Capacity { get; init; }

    public Sprint ToEntity() => new()
    {
        Name = Name.Trim(),
        Goal = string.IsNullOrWhiteSpace(Goal) ? null : Goal,
        StartDate = StartDate!.Value,
        EndDate = EndDate!.Value,
        Capacity = Capacity
    };
}

// Null sends the open tickets to the backlog.
public record SprintCompleteRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Destination sprint is not valid.")]
    public int? MoveOpenTicketsTo { get; init; }
}

public record SprintCompleteResponse(SprintSummary Sprint, int MovedTickets);
