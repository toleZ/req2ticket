using Domain.Common;
using Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace Web.DTOs;

// PUT is a full replacement, so the shape matches TicketCreateRequest minus Type: the type is
// assigned once on create and never updated, because Code carries its prefix. It lives in its
// own record so both can diverge later without breaking the other.
public record TicketUpdateRequest
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(160, MinimumLength = 3, ErrorMessage = "El título debe tener entre 3 y 160 caracteres.")]
    public string Title { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "La descripción no puede superar los 2000 caracteres.")]
    public string? Description { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "EpicId inválido.")]
    public int EpicId { get; init; }

    /* The [JsonConverter] on the enum type itself is not consulted for a nullable property:
       System.Text.Json looks for attributes on Nullable<TicketType>, which has none, and falls
       back to the default converter — which accepts integers. So "type": 2 would quietly bind
       to Bug, which is exactly what StringOnlyEnumConverter exists to prevent.
       Repeating it here, on the property, is what actually turns integers off. */
    [JsonConverter(typeof(StringOnlyEnumConverter<TicketPriority>))]
    [EnumDataType(typeof(TicketPriority), ErrorMessage = "Prioridad inválida.")]
    public TicketPriority? Priority { get; init; }

    [JsonConverter(typeof(StringOnlyEnumConverter<TicketStatus>))]
    [EnumDataType(typeof(TicketStatus), ErrorMessage = "Estado inválido.")]
    public TicketStatus? Status { get; init; }

    [Range(0, int.MaxValue, ErrorMessage = "Los puntos no pueden ser negativos.")]
    public int Points { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "AssigneeId inválido.")]
    public int? AssigneeId { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "ReporterId inválido.")]
    public int? ReporterId { get; init; }

    // Optional: a ticket without a sprint stays in the backlog.
    [Range(1, int.MaxValue, ErrorMessage = "SprintId inválido.")]
    public int? SprintId { get; init; }

    // Optional: the ticket this one was split out of.
    [Range(1, int.MaxValue, ErrorMessage = "ParentId inválido.")]
    public int? ParentId { get; init; }

    // Read against the ticket's existing Type, since Type cannot change. See
    // TicketCreateRequest for why this is a JsonElement and not a string.
    public JsonElement? ExtraFields { get; init; }

    public Ticket ToEntity() => new()
    {
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
        ExtraFields = ExtraFields?.GetRawText()
    };
}
