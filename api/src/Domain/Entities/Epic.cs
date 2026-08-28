using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public class Epic
{
    [Key]
    public int Id { get; set; }

    // Public identifier, assigned by the service on create. It never changes and is
    // never accepted from the client.
    [Required]
    [StringLength(EpicCode.Length)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(120, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    public EpicAccentColor? AccentColor { get; set; }

    public EpicPriority Priority { get; set; } = EpicPriority.Medium;

    public EpicStatus Status { get; set; } = EpicStatus.Backlog;

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
    [JsonStringEnumMemberName("backlog")]
    Backlog,

    [JsonStringEnumMemberName("active")]
    Active,

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
