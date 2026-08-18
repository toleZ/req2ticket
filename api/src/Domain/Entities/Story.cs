using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public class Story
{
    [Key]
    public int Id { get; set; }

    // Public identifier, assigned by the service on create. It never changes and is
    // never accepted from the client.
    [Required]
    [StringLength(StoryCode.Length)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(160, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    // A story always belongs to an epic — unlike Epic.OwnerId, this FK is required.
    public int EpicId { get; set; }

    public Epic? Epic { get; set; }

    public StoryPriority Priority { get; set; } = StoryPriority.Medium;

    public StoryStatus Status { get; set; } = StoryStatus.Todo;

    public int Points { get; set; }

    public int? AssigneeId { get; set; }

    public User? Assignee { get; set; }

    // Nullable on purpose, unlike EpicId: a story without a sprint is the backlog, not
    // missing data. Deleting the sprint sends its stories back there instead of removing
    // them, which is why the relationship is configured with SetNull.
    public int? SprintId { get; set; }

    public Sprint? Sprint { get; set; }

    public int CriteriaTotal { get; set; }

    public int CriteriaDone { get; set; }
}

[JsonConverter(typeof(StringOnlyEnumConverter<StoryPriority>))]
public enum StoryPriority
{
    [JsonStringEnumMemberName("low")]
    Low,

    [JsonStringEnumMemberName("medium")]
    Medium,

    [JsonStringEnumMemberName("high")]
    High,

    [JsonStringEnumMemberName("critical")]
    Critical
}

[JsonConverter(typeof(StringOnlyEnumConverter<StoryStatus>))]
public enum StoryStatus
{
    [JsonStringEnumMemberName("todo")]
    Todo,

    [JsonStringEnumMemberName("inProgress")]
    InProgress,

    [JsonStringEnumMemberName("done")]
    Done
}
