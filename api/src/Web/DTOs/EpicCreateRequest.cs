using System.ComponentModel.DataAnnotations;
using Domain.Entities;

namespace Web.DTOs;

public record EpicCreateRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 120 characters.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string? Description { get; init; }

    [EnumDataType(typeof(EpicAccentColor), ErrorMessage = "Invalid color.")]
    public EpicAccentColor? AccentColor { get; init; }

    [EnumDataType(typeof(EpicPriority), ErrorMessage = "Invalid priority.")]
    public EpicPriority? Priority { get; init; }

    [EnumDataType(typeof(EpicStatus), ErrorMessage = "Invalid status.")]
    public EpicStatus? Status { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Invalid OwnerId.")]
    public int? OwnerId { get; init; }

    public Epic ToEntity() => new()
    {
        Name = Name,
        Description = Description,
        AccentColor = AccentColor,
        Priority = Priority ?? EpicPriority.Medium,
        Status = Status ?? EpicStatus.Backlog,
        OwnerId = OwnerId
    };
}
