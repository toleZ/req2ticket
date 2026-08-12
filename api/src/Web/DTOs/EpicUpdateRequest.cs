using System.ComponentModel.DataAnnotations;
using Domain.Entities;

namespace Web.DTOs;

// PUT is a full replacement, so the shape matches EpicCreateRequest.
// It lives in its own record so both can diverge later without breaking the other.
public record EpicUpdateRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 120 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "La descripción no puede superar los 2000 caracteres.")]
    public string? Description { get; init; }

    [EnumDataType(typeof(EpicAccentColor), ErrorMessage = "Color inválido.")]
    public EpicAccentColor? AccentColor { get; init; }

    [EnumDataType(typeof(EpicPriority), ErrorMessage = "Prioridad inválida.")]
    public EpicPriority? Priority { get; init; }

    [EnumDataType(typeof(EpicStatus), ErrorMessage = "Estado inválido.")]
    public EpicStatus? Status { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "OwnerId inválido.")]
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
