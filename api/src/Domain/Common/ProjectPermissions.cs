using Domain.Entities;
using System.Text.Json.Serialization;

namespace Domain.Common;

// Named permissions, spelled in JSON as "tickets.write". The front end never compares roles: it
// receives the list of these a user has in the project (myPermissions) and asks for one by name.
[JsonConverter(typeof(StringOnlyEnumConverter<Permission>))]
public enum Permission
{
    [JsonStringEnumMemberName("tickets.write")]
    TicketsWrite,

    [JsonStringEnumMemberName("tickets.delete")]
    TicketsDelete,

    [JsonStringEnumMemberName("epics.manage")]
    EpicsManage,

    [JsonStringEnumMemberName("sprints.manage")]
    SprintsManage,

    [JsonStringEnumMemberName("workflow.edit")]
    WorkflowEdit,

    [JsonStringEnumMemberName("project.edit")]
    ProjectEdit,

    [JsonStringEnumMemberName("project.archive")]
    ProjectArchive,

    [JsonStringEnumMemberName("members.manage")]
    MembersManage,

    // Platform permissions: only a SuperAdmin has them, in every project.
    [JsonStringEnumMemberName("users.manage")]
    UsersManage,

    [JsonStringEnumMemberName("projects.delete")]
    ProjectsDelete
}

/* The permission matrix (DEC-2), in one file and nowhere else. A service that checks
   `role == ProjectRole.Admin` on its own is a bug: add a permission here instead.

   Being a member is enough to read everything in the project, so reading has no permission. */
public static class ProjectPermissions
{
    private static readonly Dictionary<Permission, ProjectRole[]> Matrix = new()
    {
        [Permission.TicketsWrite] =
            [ProjectRole.Qa, ProjectRole.Developer, ProjectRole.ScrumMaster, ProjectRole.ProductOwner, ProjectRole.Admin],
        [Permission.TicketsDelete] = [ProjectRole.ScrumMaster, ProjectRole.ProductOwner, ProjectRole.Admin],
        [Permission.EpicsManage] = [ProjectRole.ProductOwner, ProjectRole.Admin],
        [Permission.SprintsManage] = [ProjectRole.ScrumMaster, ProjectRole.Admin],
        [Permission.WorkflowEdit] = [ProjectRole.ScrumMaster, ProjectRole.Admin],
        [Permission.ProjectEdit] = [ProjectRole.Admin],
        [Permission.ProjectArchive] = [ProjectRole.Admin],
        [Permission.MembersManage] = [ProjectRole.Admin]
    };

    private static readonly Permission[] PlatformOnly = [Permission.UsersManage, Permission.ProjectsDelete];

    // What still works in an archived project: restoring it, and a SuperAdmin deleting it. Every
    // other write is refused with "Project is archived." Reading is never affected.
    public static readonly IReadOnlySet<Permission> AllowedWhileArchived =
        new HashSet<Permission> { Permission.ProjectArchive, Permission.ProjectsDelete };

    /* The permissions someone actually has in a project right now. A SuperAdmin counts as Admin
       in every project, member or not, plus the platform permissions. In an archived project only
       AllowedWhileArchived survives — so the front end gets read-only for free from this list. */
    public static IReadOnlyList<Permission> For(ProjectRole? role, PlatformRole platformRole, bool isArchived)
    {
        bool isSuperAdmin = platformRole == PlatformRole.SuperAdmin;
        ProjectRole? effectiveRole = isSuperAdmin ? ProjectRole.Admin : role;

        IEnumerable<Permission> granted = effectiveRole is null
            ? []
            : Matrix.Where(entry => entry.Value.Contains(effectiveRole.Value)).Select(entry => entry.Key);

        if (isSuperAdmin)
        {
            granted = granted.Concat(PlatformOnly);
        }

        if (isArchived)
        {
            granted = granted.Where(AllowedWhileArchived.Contains);
        }

        return granted.ToList();
    }

    public static bool Has(ProjectRole? role, PlatformRole platformRole, Permission permission) =>
        For(role, platformRole, isArchived: false).Contains(permission);

    // The catalog behind GET /api/roles, least to most privilege. The front end explains each
    // role from this, so it never keeps its own copy of the matrix.
    public static IReadOnlyList<(ProjectRole Role, IReadOnlyList<Permission> Permissions)> RoleCatalog() =>
        Enum.GetValues<ProjectRole>()
            .Select(role => (role, (IReadOnlyList<Permission>)Matrix
                .Where(entry => entry.Value.Contains(role))
                .Select(entry => entry.Key)
                .ToList()))
            .ToList();
}
