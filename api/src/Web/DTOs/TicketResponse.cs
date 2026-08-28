using System.Text.Json;
using Domain.Entities;

namespace Web.DTOs;

// Epic, Assignee, Reporter, Sprint and Parent are flattened into scalar fields so the
// navigation graph is never serialized. The enums serialize as the lowercase names declared
// on each type.
public record TicketResponse(
    int Id,
    string Code,
    TicketType Type,
    string Title,
    string? Description,
    int EpicId,
    string? EpicName,
    TicketPriority Priority,
    TicketStatus Status,
    int Points,
    int? AssigneeId,
    string? AssigneeName,
    int? ReporterId,
    string? ReporterName,
    int? SprintId,
    string? SprintName,
    int? ParentId,
    JsonElement? ExtraFields,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static TicketResponse FromEntity(Ticket ticket) => new(
        ticket.Id,
        ticket.Code,
        ticket.Type,
        ticket.Title,
        ticket.Description,
        ticket.EpicId,
        ticket.Epic?.Name,
        ticket.Priority,
        ticket.Status,
        ticket.Points,
        ticket.AssigneeId,
        ticket.Assignee?.Name,
        ticket.ReporterId,
        ticket.Reporter?.Name,
        ticket.SprintId,
        ticket.Sprint?.Name,
        ticket.ParentId,
        ParseExtras(ticket.ExtraFields),
        ticket.CreatedAt,
        ticket.UpdatedAt);

    /* The column holds text, but the response has to carry an object — otherwise the client
       receives a string full of escaped quotes and has to parse it itself.

       Clone() is not optional. RootElement points into the buffer the JsonDocument owns, and
       `using` frees that buffer at the end of this method: returning the element without
       cloning hands out a pointer to freed memory, and it blows up at serialization time,
       far away from here. */
    private static JsonElement? ParseExtras(string? storedJson)
    {
        if (string.IsNullOrWhiteSpace(storedJson))
        {
            return null;
        }

        using JsonDocument document = JsonDocument.Parse(storedJson);
        return document.RootElement.Clone();
    }
}
