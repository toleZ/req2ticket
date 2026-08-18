using System.ComponentModel.DataAnnotations;
using Domain.Entities;

namespace Web.DTOs;

public record StoryCreateRequest
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(160, MinimumLength = 3, ErrorMessage = "El título debe tener entre 3 y 160 caracteres.")]
    public string Title { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "La descripción no puede superar los 2000 caracteres.")]
    public string? Description { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "EpicId inválido.")]
    public int EpicId { get; init; }

    [EnumDataType(typeof(StoryPriority), ErrorMessage = "Prioridad inválida.")]
    public StoryPriority? Priority { get; init; }

    [EnumDataType(typeof(StoryStatus), ErrorMessage = "Estado inválido.")]
    public StoryStatus? Status { get; init; }

    [Range(0, int.MaxValue, ErrorMessage = "Los puntos no pueden ser negativos.")]
    public int Points { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "AssigneeId inválido.")]
    public int? AssigneeId { get; init; }

    [Range(0, int.MaxValue, ErrorMessage = "La cantidad de criterios no puede ser negativa.")]
    public int CriteriaTotal { get; init; }

    // Manual mapping: AutoMapper is not installed.
    public Story ToEntity() => new()
    {
        Title = Title,
        Description = Description,
        EpicId = EpicId,
        Priority = Priority ?? StoryPriority.Medium,
        Status = Status ?? StoryStatus.Todo,
        Points = Points,
        AssigneeId = AssigneeId,
        CriteriaTotal = CriteriaTotal,
        CriteriaDone = 0
    };
}
