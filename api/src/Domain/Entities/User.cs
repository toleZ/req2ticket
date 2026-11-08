using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(80)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(120)]
    public string Email { get; set; } = string.Empty;

    // BCrypt hash, never the password itself. 100 characters is room to spare: the format
    // is fixed at 60. [JsonIgnore] is a safety net, NOT the mechanism: the real guarantee
    // is that no endpoint ever returns this entity, only UserResponse.
    [Required]
    [StringLength(100)]
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    // Only the platform role lives on the user. What someone may do inside a project is their
    // ProjectMember.Role there, which is why the same person can be Admin in one project and
    // Viewer in another.
    public PlatformRole PlatformRole { get; set; } = PlatformRole.User;
}

// User is 0 on purpose: enums are stored as INTEGER, so 0 is what a row lands on when nobody
// assigns a role. Least privilege has to be the value you get by accident.
[JsonConverter(typeof(StringOnlyEnumConverter<PlatformRole>))]
public enum PlatformRole
{
    [JsonStringEnumMemberName("user")]
    User,

    // Admin of every project, member or not, plus the platform itself: managing users and
    // deleting projects for good.
    [JsonStringEnumMemberName("superAdmin")]
    SuperAdmin
}
