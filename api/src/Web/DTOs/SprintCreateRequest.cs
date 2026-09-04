using System.ComponentModel.DataAnnotations;
using Domain.Entities;

namespace Web.DTOs;

public record SprintCreateRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 120 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(500, ErrorMessage = "La meta no puede superar los 500 caracteres.")]
    public string? Goal { get; init; }

    [Required(ErrorMessage = "La fecha de inicio es obligatoria.")]
    public DateOnly StartDate { get; init; }

    [Required(ErrorMessage = "La fecha de fin es obligatoria.")]
    public DateOnly EndDate { get; init; }

    [Range(0, 999, ErrorMessage = "La capacidad debe estar entre 0 y 999.")]
    public int Capacity { get; init; }

    [EnumDataType(typeof(SprintStatus), ErrorMessage = "Estado inválido.")]
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
