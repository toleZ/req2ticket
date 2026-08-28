using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

// One table for every kind of work item. What every type shares lives in a column; what only
// one type needs lives in ExtraFields, shaped by Type. Adding a fifth type is a new enum
// member plus a new record in TicketExtras.cs — not a new table.
public class Ticket
{
    [Key]
    public int Id { get; set; }

    // Public identifier, assigned by the service on create. It never changes and is
    // never accepted from the client.
    [Required]
    [StringLength(TicketCode.MaxLength)]
    public string Code { get; set; } = string.Empty;

    // Assigned on create and never updated, same rule as Code and for the same reason: the
    // code carries this type's prefix, so a ticket that changed type would carry a code that
    // lies about what it is. Converting a bug into a task means creating a new ticket.
    public TicketType Type { get; set; }

    [Required]
    [StringLength(160, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    // A ticket always belongs to an epic — unlike Epic.OwnerId, this FK is required.
    public int EpicId { get; set; }

    public Epic? Epic { get; set; }

    public TicketPriority Priority { get; set; } = TicketPriority.Medium;

    public TicketStatus Status { get; set; } = TicketStatus.Todo;

    public int Points { get; set; }

    public int? AssigneeId { get; set; }

    public User? Assignee { get; set; }

    // Who raised it. Defaulted from the token on create, so in practice it only goes null
    // once the reporter's user row is deleted — same rule as Epic.OwnerId.
    public int? ReporterId { get; set; }

    public User? Reporter { get; set; }

    // Nullable on purpose, unlike EpicId: a ticket without a sprint is the backlog, not
    // missing data. Deleting the sprint sends its tickets back there instead of removing
    // them, which is why the relationship is configured with SetNull.
    public int? SprintId { get; set; }

    public Sprint? Sprint { get; set; }

    // "Se divide en": a user story divides into tasks, a bug into fixes. Which type may hang
    // from which is TicketService.AllowedParentTypes, and that table is what rules out
    // cycles — follow any legal chain and it ends at a user story.
    public int? ParentId { get; set; }

    public Ticket? Parent { get; set; }

    // The per-type fields, as a JSON object whose shape Type decides. SQLite has no jsonb,
    // so the column is plain TEXT: what guarantees the text is valid for this type is
    // TicketExtrasValidator, not the database.
    public string? ExtraFields { get; set; }

    // DateTimeOffset and not DateTime: SQLite stores a DateTime as TEXT without its Kind, so
    // a UTC value read back has Kind=Unspecified and serializes without the trailing "Z" —
    // and `new Date("2026-08-26T12:00:00")` in the browser is local time, so every timestamp
    // would silently shift by the reader's offset. DateTimeOffset round-trips the offset.
    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}

// UserStory is "historia de usuario" (UH) in the UI. The member is named after the concept
// rather than the Spanish abbreviation so it reads the same as every other identifier here.
[JsonConverter(typeof(StringOnlyEnumConverter<TicketType>))]
public enum TicketType
{
    [JsonStringEnumMemberName("userStory")]
    UserStory,

    // Shadows nothing: the member is only ever reachable as TicketType.Task.
    [JsonStringEnumMemberName("task")]
    Task,

    [JsonStringEnumMemberName("bug")]
    Bug,

    [JsonStringEnumMemberName("fix")]
    Fix
}

[JsonConverter(typeof(StringOnlyEnumConverter<TicketPriority>))]
public enum TicketPriority
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

// Declared in workflow order, which is also the order the board reads top to bottom.
// That order is stored, not just displayed: enums persist as INTEGER, so slipping a new
// member into the middle renumbers every one after it and silently reinterprets existing
// rows — Done would start reading as whatever took its number. Adding one needs a data
// migration, not just a new member. Today the database is dev-only and reseeded from
// HasData, which is the only reason this list could be reordered for free.
[JsonConverter(typeof(StringOnlyEnumConverter<TicketStatus>))]
public enum TicketStatus
{
    [JsonStringEnumMemberName("backlog")]
    Backlog,

    [JsonStringEnumMemberName("todo")]
    Todo,

    [JsonStringEnumMemberName("inProgress")]
    InProgress,

    [JsonStringEnumMemberName("inReview")]
    InReview,

    [JsonStringEnumMemberName("testing")]
    Testing,

    [JsonStringEnumMemberName("done")]
    Done,

    // Terminal but not success. It counts as neither completed nor outstanding, so
    // summarizeTickets in the front end drops these rows from the rollups entirely —
    // a cancelled ticket should not drag a sprint's percentage down forever.
    [JsonStringEnumMemberName("cancelled")]
    Cancelled
}

// The two enums below only ever appear inside a ticket's ExtraFields JSON, never as a column.
// They live here anyway, with the other three, so every value a ticket can carry is declared in
// one file — and so TicketExtrasValidator has a real type to validate against instead of a list
// of strings it would have to keep in step by hand.

// Severity is not Priority: severity is how badly it breaks, priority is how soon we look at
// it. A trivial bug on the login screen can be minor and critical at once.
//
// Careful with the order: default(BugSeverity) is Blocker, but a bug that arrives without a
// severity is stored as "minor". That default is spelled out in the validator's schema, not
// inferred from position.
[JsonConverter(typeof(StringOnlyEnumConverter<BugSeverity>))]
public enum BugSeverity
{
    [JsonStringEnumMemberName("blocker")]
    Blocker,

    [JsonStringEnumMemberName("major")]
    Major,

    [JsonStringEnumMemberName("minor")]
    Minor,

    [JsonStringEnumMemberName("trivial")]
    Trivial
}

// How likely the fix is to break something else.
[JsonConverter(typeof(StringOnlyEnumConverter<RegressionRisk>))]
public enum RegressionRisk
{
    [JsonStringEnumMemberName("low")]
    Low,

    [JsonStringEnumMemberName("medium")]
    Medium,

    [JsonStringEnumMemberName("high")]
    High
}
