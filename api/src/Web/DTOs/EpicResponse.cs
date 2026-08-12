using Domain.Entities;

namespace Web.DTOs;

// Owner is flattened into two scalar fields so the navigation graph is never serialized.
// The enums serialize as the lowercase names declared on each type.
public record EpicResponse(
    int Id,
    string Code,
    string Name,
    string? Description,
    EpicAccentColor? AccentColor,
    EpicPriority Priority,
    EpicStatus Status,
    int? OwnerId,
    string? OwnerName)
{
    public static EpicResponse FromEntity(Epic epic) => new(
        epic.Id,
        epic.Code,
        epic.Name,
        epic.Description,
        epic.AccentColor,
        epic.Priority,
        epic.Status,
        epic.OwnerId,
        epic.Owner?.Name);
}
