using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public class Sprint
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(120, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Goal { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    [Range(0, 999)]
    public int Capacity { get; set; }

    public SprintStatus Status { get; set; } = SprintStatus.Planned;
}

[JsonConverter(typeof(StringOnlyEnumConverter<SprintStatus>))]
public enum SprintStatus
{
    [JsonStringEnumMemberName("planned")]
    Planned,

    [JsonStringEnumMemberName("active")]
    Active,

    [JsonStringEnumMemberName("completed")]
    Completed
}
