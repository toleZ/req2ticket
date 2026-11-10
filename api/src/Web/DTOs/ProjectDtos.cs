using System.ComponentModel.DataAnnotations;
using Domain.Common;
using Domain.Entities;
using Domain.ReadModels;
using System.Text.Json.Serialization;

namespace Web.DTOs;

public record ProjectCreateRequest
{
    // Upper-cased by the service, so "r2t" is accepted as R2T.
    [Required(ErrorMessage = "Key is required.")]
    [RegularExpression("^[A-Za-z][A-Za-z0-9]{1,5}$", ErrorMessage = "The key must be 2 to 6 characters: a letter, then letters or digits.")]
    public string Key { get; init; } = string.Empty;

    [Required(ErrorMessage = "Name is required.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 120 characters.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description can't be longer than 2000 characters.")]
    public string? Description { get; init; }
}

public record ProjectUpdateRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 120 characters.")]
    public string Name { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description can't be longer than 2000 characters.")]
    public string? Description { get; init; }

    /* Declared only so a client that sends the whole project back is not refused: unknown
       properties are a 400 everywhere (UnmappedMemberHandling.Disallow). The key is immutable,
       and whatever arrives here is ignored. */
    public string? Key { get; init; }
}

// One row of "my projects". MyRole is null when a SuperAdmin sees a project they are not in.
public record ProjectListResponse(
    int Id,
    string Key,
    string Name,
    string? Description,
    bool IsArchived,
    DateTimeOffset? ArchivedAt,
    DateTimeOffset CreatedAt,
    ProjectRole? MyRole,
    int MemberCount,
    int AdminCount)
{
    public static ProjectListResponse FromReadModel(ProjectListItem project) => new(
        project.Id,
        project.Key,
        project.Name,
        project.Description,
        project.ArchivedAt is not null,
        project.ArchivedAt,
        project.CreatedAt,
        project.MyRole,
        project.MemberCount,
        project.AdminCount);
}

/* The project opened, with what the caller may do in it. MyPermissions is what the front end asks
   with can(...): it is already effective — SuperAdmin counted as Admin, and an archived project
   reduced to restoring it — so the screens never apply role rules of their own. */
public record ProjectResponse(
    int Id,
    string Key,
    string Name,
    string? Description,
    bool IsArchived,
    DateTimeOffset? ArchivedAt,
    DateTimeOffset CreatedAt,
    ProjectRole? MyRole,
    bool IsSuperAdmin,
    IReadOnlyList<Permission> MyPermissions)
{
    public static ProjectResponse FromEntity(Project project, ProjectAccess access) => new(
        project.Id,
        project.Key,
        project.Name,
        project.Description,
        project.ArchivedAt is not null,
        project.ArchivedAt,
        project.CreatedAt,
        access.Role,
        access.IsSuperAdmin,
        access.Permissions);
}

public record MemberAddRequest
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not valid.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Role is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<ProjectRole>))]
    [EnumDataType(typeof(ProjectRole), ErrorMessage = "Role is not valid.")]
    public ProjectRole? Role { get; init; }
}

public record MemberRoleRequest
{
    [Required(ErrorMessage = "Role is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<ProjectRole>))]
    [EnumDataType(typeof(ProjectRole), ErrorMessage = "Role is not valid.")]
    public ProjectRole? Role { get; init; }
}

// The catalog of roles, least to most privilege, for the screens that explain them.
public record RoleResponse(ProjectRole Role, IReadOnlyList<Permission> Permissions);

public record WorkflowRequest
{
    [Required(ErrorMessage = "Transitions are required.")]
    public List<WorkflowTransitionRequest> Transitions { get; init; } = [];
}

public record WorkflowTransitionRequest
{
    [Required(ErrorMessage = "From is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<TicketStatus>))]
    [EnumDataType(typeof(TicketStatus), ErrorMessage = "Status is not valid.")]
    public TicketStatus? From { get; init; }

    [Required(ErrorMessage = "To is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<TicketStatus>))]
    [EnumDataType(typeof(TicketStatus), ErrorMessage = "Status is not valid.")]
    public TicketStatus? To { get; init; }
}

public record WorkflowTransitionResponse(TicketStatus From, TicketStatus To);

public record WorkflowResponse(List<WorkflowTransitionResponse> Transitions, DateTimeOffset UpdatedAt)
{
    // Ordered like the board reads: by origin status, then destination.
    public static WorkflowResponse FromEntity(Workflow workflow) => new(
        workflow.Transitions
            .OrderBy(t => t.FromStatus)
            .ThenBy(t => t.ToStatus)
            .Select(t => new WorkflowTransitionResponse(t.FromStatus, t.ToStatus))
            .ToList(),
        workflow.UpdatedAt);
}
