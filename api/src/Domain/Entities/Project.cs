using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

// The workspace everything else hangs from: epics, sprints, tickets, members and the workflow
// all carry a ProjectId, and every route that reads them goes through /api/projects/{pid}.
public class Project
{
    [Key]
    public int Id { get; set; }

    // The prefix of every code in the project (R2T-UH-12). Immutable for that reason: changing
    // it would leave every existing code lying about where it belongs. Unique across all
    // projects, archived ones included, so a key is never reused.
    [Required]
    [StringLength(6, MinimumLength = 2)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [StringLength(120, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    // Null while active. Archiving is reversible and keeps everything readable: writes are
    // refused at the door by the permission filters, not here.
    public DateTimeOffset? ArchivedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    /* The next number of each sequence. One per kind because codes count separately: the
       first bug is R2T-BUG-1 even if there are ten stories. They are only ever touched by
       ProjectRepository.TakeNextNumberAsync, an atomic UPDATE … RETURNING, never by
       loading the project and saving it back — the context marks them as ignored on update
       so a stale copy cannot rewind them. */
    public int NextEpicNumber { get; set; } = 1;

    public int NextUserStoryNumber { get; set; } = 1;

    public int NextTaskNumber { get; set; } = 1;

    public int NextBugNumber { get; set; } = 1;

    public int NextFixNumber { get; set; } = 1;

    public List<ProjectMember> Members { get; set; } = [];
}
