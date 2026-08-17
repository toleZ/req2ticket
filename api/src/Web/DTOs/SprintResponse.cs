using Domain.Entities;

namespace Web.DTOs;

public record SprintResponse(
    int Id,
    string Name,
    string? Goal,
    DateOnly StartDate,
    DateOnly EndDate,
    int Capacity,
    SprintStatus Status)
{
    public static SprintResponse FromEntity(Sprint sprint) => new(
        sprint.Id,
        sprint.Name,
        sprint.Goal,
        sprint.StartDate,
        sprint.EndDate,
        sprint.Capacity,
        sprint.Status);
}
