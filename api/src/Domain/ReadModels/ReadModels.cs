using Domain.Common;
using Domain.Entities;

namespace Domain.ReadModels;

/* Shapes the repositories build straight from a query (.Select), for lists and for the
   permission check. They are not entities: nothing tracks or saves them, and they carry
   counts the database computes so the front end never walks every ticket to get a number.
   The controllers return them as they are. */

// What the permission filters need about the caller in one project, read in a single query.
// Null from the repository means "no such project, or not yours" — both answer 404.
public sealed record ProjectAccess(
    int ProjectId,
    string Key,
    bool IsArchived,
    ProjectRole? Role,
    PlatformRole PlatformRole)
{
    public bool IsSuperAdmin => PlatformRole == PlatformRole.SuperAdmin;

    // Effective, not nominal: a SuperAdmin counts as Admin, and an archived project keeps only
    // what ProjectPermissions.AllowedWhileArchived allows.
    public IReadOnlyList<Permission> Permissions => ProjectPermissions.For(Role, PlatformRole, IsArchived);

    public bool Has(Permission permission) => ProjectPermissions.Has(Role, PlatformRole, permission);
}

// One row of "my projects". MyRole is null when a SuperAdmin sees a project they are not in.
// MemberCount and AdminCount feed the SuperAdmin's list: a project with no Admin needs one.
public sealed record ProjectListItem(
    int Id,
    string Key,
    string Name,
    string? Description,
    DateTimeOffset? ArchivedAt,
    DateTimeOffset CreatedAt,
    ProjectRole? MyRole,
    int MemberCount,
    int AdminCount);

/* The light version of a ticket, for lists and the board. No description and no lists: the
   detail brings those. ChecklistDone/Total are the progress of the type's main list
   (acceptance criteria, checklist or verification steps) and are null for bugs, which have none. */
public sealed record TicketSummary(
    int Id,
    string Code,
    TicketType Type,
    string Title,
    TicketStatus Status,
    TicketPriority Priority,
    int? EpicId,
    int? AssigneeId,
    int? SprintId,
    int? ParentId,
    int? Points,
    int? ChecklistDone,
    int? ChecklistTotal,
    int OpenChildrenCount,
    DateTimeOffset UpdatedAt);

// A ticket as a reference: what a parent shows of its children.
public sealed record TicketRef(int Id, string Code, TicketType Type, string Title, TicketStatus Status);

public sealed record EpicSummary(
    int Id,
    string Code,
    string Name,
    EpicAccentColor? AccentColor,
    EpicPriority Priority,
    EpicStatus Status,
    int? OwnerId,
    int TicketCount,
    int OpenTicketsCount,
    int DoneTicketsCount);

// CommittedPoints adds the points of the sprint's stories and tasks (bugs and fixes have none).
public sealed record SprintSummary(
    int Id,
    string Name,
    string? Goal,
    DateOnly StartDate,
    DateOnly EndDate,
    int Capacity,
    SprintStatus Status,
    int TicketCount,
    int OpenTicketCount,
    int CommittedPoints);

// AssignedTickets and OwnedEpics count only this project: they are what removing the member
// would leave unassigned, and the confirmation shows them.
public sealed record MemberSummary(
    int UserId,
    string Name,
    string Email,
    ProjectRole Role,
    int AssignedTickets,
    int OwnedEpics);
