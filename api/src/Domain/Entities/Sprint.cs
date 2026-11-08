using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public class Sprint
{
    [Key]
    public int Id { get; set; }

    // Set by the service from the route, never from the body.
    public int ProjectId { get; set; }

    [Required]
    [StringLength(120, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Goal { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    [Range(0, 999)]
    public int Capacity { get; set; }

    // Only moves forward, and only through SprintService.StartAsync and CompleteAsync: the PUT
    // that edits the data never touches it. A partial unique index keeps one active per project.
    public SprintStatus Status { get; set; } = SprintStatus.Planned;
}

// Planned is 0 and Active is 1: the partial unique index filters on Status = 1, so this order
// is part of the schema.
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
