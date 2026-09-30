using System.ComponentModel.DataAnnotations;
using Domain.Entities;

namespace Web.DTOs;

// PUT is a full replacement, so the shape matches SprintCreateRequest.
// It lives in its own record so both can diverge later without breaking the other.
public record SprintUpdateRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 120 characters.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(500, ErrorMessage = "Goal cannot exceed 500 characters.")]
    public string? Goal { get; init; }

    [Required(ErrorMessage = "Start date is required.")]
    public DateOnly StartDate { get; init; }

    [Required(ErrorMessage = "End date is required.")]
    public DateOnly EndDate { get; init; }

    [Range(0, 999, ErrorMessage = "Capacity must be between 0 and 999.")]
    public int Capacity { get; init; }

    [EnumDataType(typeof(SprintStatus), ErrorMessage = "Invalid status.")]
    public SprintStatus? Status { get; init; }

    public Sprint ToEntity() => new()
    {
        Name = Name,
        Goal = Goal,
        StartDate = StartDate,
        EndDate = EndDate,
        Capacity = Capacity,
        Status = Status ?? SprintStatus.Planned
    };
}
