using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public class Epic
{
    [Key]
    public int Id { get; set; }

    // Set by the service from the route, never from the body.
    public int ProjectId { get; set; }

    // Position in the project's epic sequence. With the key it builds Code (R2T-EPIC-3).
    public int Number { get; set; }

    // Assigned once on create, never accepted from the client.
    [Required]
    [StringLength(WorkItemCode.MaxLength)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(120, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    public EpicAccentColor? AccentColor { get; set; }

    public EpicPriority Priority { get; set; } = EpicPriority.Medium;

    // Closing is manual and only allowed once every ticket is done or cancelled (EpicService).
    public EpicStatus Status { get; set; } = EpicStatus.Open;

    // Has to be a member of the project.
    public int? OwnerId { get; set; }

    public User? Owner { get; set; }
}

[JsonConverter(typeof(StringOnlyEnumConverter<EpicPriority>))]
public enum EpicPriority
{
    [JsonStringEnumMemberName("low")]
    Low,

    [JsonStringEnumMemberName("medium")]
    Medium,

    [JsonStringEnumMemberName("high")]
    High,

    [JsonStringEnumMemberName("urgent")]
    Urgent
}

[JsonConverter(typeof(StringOnlyEnumConverter<EpicStatus>))]
public enum EpicStatus
{
    [JsonStringEnumMemberName("open")]
    Open,

    [JsonStringEnumMemberName("closed")]
    Closed
}

// Palette names, not hex: the front end resolves each one to a Tailwind class.
[JsonConverter(typeof(StringOnlyEnumConverter<EpicAccentColor>))]
public enum EpicAccentColor
{
    [JsonStringEnumMemberName("blue")]
    Blue,

    [JsonStringEnumMemberName("purple")]
    Purple,

    [JsonStringEnumMemberName("indigo")]
    Indigo,

    [JsonStringEnumMemberName("teal")]
    Teal,

    [JsonStringEnumMemberName("green")]
    Green,

    [JsonStringEnumMemberName("orange")]
    Orange,

    [JsonStringEnumMemberName("red")]
    Red,

    [JsonStringEnumMemberName("pink")]
    Pink,

    [JsonStringEnumMemberName("mint")]
    Mint,

    [JsonStringEnumMemberName("yellow")]
    Yellow
}
