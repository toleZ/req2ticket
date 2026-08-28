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

    // Viewer is the default on purpose: a code path that forgets to assign a role grants
    // read-only access rather than the ability to edit.
    public UserRole Role { get; set; } = UserRole.Viewer;
}

// The names follow Scrum, since that is what the app models: epics, tickets and sprints.
// SuperAdmin administers the platform; Admin administers this workspace.
//
// Declared from least to most privilege, which puts Viewer at 0. That is not cosmetic:
// enums are stored as INTEGER, so 0 is what a row lands on when nobody assigns a role —
// a column default, a raw INSERT, a future migration. Least privilege has to be the value
// you get by accident. For the same reason, new roles go at the position their privilege
// deserves, and doing so renumbers the ones after it: that needs a data migration, not just
// a new member.
[JsonConverter(typeof(StringOnlyEnumConverter<UserRole>))]
public enum UserRole
{
    [JsonStringEnumMemberName("viewer")]
    Viewer,

    [JsonStringEnumMemberName("qa")]
    Qa,

    [JsonStringEnumMemberName("developer")]
    Developer,

    [JsonStringEnumMemberName("scrumMaster")]
    ScrumMaster,

    [JsonStringEnumMemberName("productOwner")]
    ProductOwner,

    [JsonStringEnumMemberName("admin")]
    Admin,

    [JsonStringEnumMemberName("superAdmin")]
    SuperAdmin
}
