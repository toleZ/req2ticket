using Domain.Common;
using System.Text.Json.Serialization;

namespace Domain.Entities;

// Who belongs to a project and with which role. There is no separate "team" entity: the team
// of a project is its members. The key is (ProjectId, UserId), so a user is in a project once.
public class ProjectMember
{
    public int ProjectId { get; set; }

    public Project? Project { get; set; }

    public int UserId { get; set; }

    public User? User { get; set; }

    public ProjectRole Role { get; set; } = ProjectRole.Viewer;
}

/* Declared from least to most privilege, so Viewer is 0: a row stored without a role lands on
   read-only, never on edit. What each role may do is ProjectPermissions, in one file — never a
   comparison of these ordinals scattered around the services. */
[JsonConverter(typeof(StringOnlyEnumConverter<ProjectRole>))]
public enum ProjectRole
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
    Admin
}
