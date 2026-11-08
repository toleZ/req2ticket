using Domain.ValueObjects;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

/* The four kinds of ticket, each in its own table (see Ticket). They live together in this file
   because each one is only its fields; the rules about them are in TicketService.

   The lists are jsonb columns of ChecklistItem, one column per list. Never null: an empty list
   is []. Editing a list replaces the whole array. */

// "Historia de usuario" (UH): something the user needs, told from their side. The narrative
// ("Como… quiero… para…") goes in Description.
public class UserStory : Ticket
{
    public UserStory() => Type = TicketType.UserStory;

    // Story points. Null means "not estimated yet", which is not the same as 0.
    [Range(0, 100)]
    public int? Points { get; set; }

    public List<ChecklistItem> AcceptanceCriteria { get; set; } = [];

    public List<ChecklistItem> DefinitionOfReady { get; set; } = [];

    public List<ChecklistItem> DefinitionOfDone { get; set; } = [];
}

/* Not named Task: that would clash with System.Threading.Tasks.Task in every `async Task` of any
   file that uses it. The table is still called Tasks. */
public class TicketTask : Ticket
{
    public TicketTask() => Type = TicketType.Task;

    [Range(0, 100)]
    public int? Points { get; set; }

    public List<ChecklistItem> Checklist { get; set; } = [];
}

// No points on bugs or fixes: they are not estimated work.
public class Bug : Ticket
{
    public Bug() => Type = TicketType.Bug;

    // Required, minor by default. Note default(BugSeverity) is Blocker: the default here is
    // explicit on purpose, never inferred from the enum's order.
    public BugSeverity Severity { get; set; } = BugSeverity.Minor;

    // Required: a bug without steps cannot be worked on.
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string StepsToReproduce { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? ExpectedResult { get; set; }

    [StringLength(1000)]
    public string? ActualResult { get; set; }

    [StringLength(200)]
    public string? Environment { get; set; }
}

// The repair of a bug. Always hangs from one: TicketService refuses a fix without a bug parent.
public class Fix : Ticket
{
    public Fix() => Type = TicketType.Fix;

    // Filled in as the investigation goes, so both are optional.
    [StringLength(2000)]
    public string? RootCause { get; set; }

    [StringLength(2000)]
    public string? Solution { get; set; }

    public RegressionRisk RegressionRisk { get; set; } = RegressionRisk.Low;

    public List<ChecklistItem> VerificationSteps { get; set; } = [];
}
