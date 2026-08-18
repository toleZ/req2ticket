using Domain.Entities;

namespace Web.DTOs;

// Epic, Assignee and Sprint are flattened into scalar fields so the navigation graph is
// never serialized. The enums serialize as the lowercase names declared on each type.
public record StoryResponse(
    int Id,
    string Code,
    string Title,
    string? Description,
    int EpicId,
    string? EpicName,
    StoryPriority Priority,
    StoryStatus Status,
    int Points,
    int? AssigneeId,
    string? AssigneeName,
    int? SprintId,
    string? SprintName,
    int CriteriaTotal,
    int CriteriaDone)
{
    public static StoryResponse FromEntity(Story story) => new(
        story.Id,
        story.Code,
        story.Title,
        story.Description,
        story.EpicId,
        story.Epic?.Name,
        story.Priority,
        story.Status,
        story.Points,
        story.AssigneeId,
        story.Assignee?.Name,
        story.SprintId,
        story.Sprint?.Name,
        story.CriteriaTotal,
        story.CriteriaDone);
}
