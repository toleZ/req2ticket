using Domain.Common;
using Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace Web.DTOs;

public record TicketCreateRequest
{
    // Defaults to userStory rather than being required, so a client that predates the four
    // types still creates something sensible instead of a 400.
    /* The [JsonConverter] on the enum type itself is not consulted for a nullable property:
       System.Text.Json looks for attributes on Nullable<TicketType>, which has none, and falls
       back to the default converter — which accepts integers. So "type": 2 would quietly bind
       to Bug, which is exactly what StringOnlyEnumConverter exists to prevent.
       Repeating it here, on the property, is what actually turns integers off. */
    [JsonConverter(typeof(StringOnlyEnumConverter<TicketType>))]
    [EnumDataType(typeof(TicketType), ErrorMessage = "Invalid ticket type.")]
    public TicketType? Type { get; init; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(160, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 160 characters.")]
    public string Title { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string? Description { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Invalid EpicId.")]
    public int EpicId { get; init; }

    [JsonConverter(typeof(StringOnlyEnumConverter<TicketPriority>))]
    [EnumDataType(typeof(TicketPriority), ErrorMessage = "Invalid priority.")]
    public TicketPriority? Priority { get; init; }

    [JsonConverter(typeof(StringOnlyEnumConverter<TicketStatus>))]
    [EnumDataType(typeof(TicketStatus), ErrorMessage = "Invalid status.")]
    public TicketStatus? Status { get; init; }

    [Range(0, int.MaxValue, ErrorMessage = "Points cannot be negative.")]
    public int Points { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Invalid AssigneeId.")]
    public int? AssigneeId { get; init; }

    // Optional: the controller falls back to whoever is authenticated when it is absent.
    [Range(1, int.MaxValue, ErrorMessage = "Invalid ReporterId.")]
    public int? ReporterId { get; init; }

    // Optional: a ticket without a sprint stays in the backlog.
    [Range(1, int.MaxValue, ErrorMessage = "Invalid SprintId.")]
    public int? SprintId { get; init; }

    // Optional: the ticket this one was split out of.
    [Range(1, int.MaxValue, ErrorMessage = "Invalid ParentId.")]
    public int? ParentId { get; init; }

    /* JsonElement and not string: it makes the client send a real object
       ("extraFields": { "severity": "…" }) instead of a JSON-encoded string, and it is what shows
       up as an object in the OpenAPI document.

       Nothing here inspects it. Validating it is TicketExtrasValidator's job, because the rule
       is "these keys, for this Type", and DataAnnotations cannot express a rule that depends
       on another property. */
    public JsonElement? ExtraFields { get; init; }

    // Manual mapping: AutoMapper is not installed.
    public Ticket ToEntity() => new()
    {
        Type = Type ?? TicketType.UserStory,
        Title = Title,
        Description = Description,
        EpicId = EpicId,
        Priority = Priority ?? TicketPriority.Medium,
        Status = Status ?? TicketStatus.Todo,
        Points = Points,
        AssigneeId = AssigneeId,
        ReporterId = ReporterId,
        SprintId = SprintId,
        ParentId = ParentId,

        // The raw text, exactly as it arrived. TicketService replaces it with the canonical
        // document before anything reaches the repository — the DTO never validates.
        ExtraFields = ExtraFields?.GetRawText()
    };
}
