namespace Domain.Entities;

/* The moves a project allows between ticket statuses. Optional: a project without one moves
   freely, like before. It never adds, renames or hides statuses — those are TicketStatus for
   every project — it only lists which "from → to" pairs are legal.

   Checked in one place, TicketService.ChangeStatusAsync, which both the detail and the board
   go through. */
public class Workflow
{
    public int Id { get; set; }

    // Unique: one workflow per project.
    public int ProjectId { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public List<WorkflowTransition> Transitions { get; set; } = [];
}

// Keyed by (WorkflowId, FromStatus, ToStatus), so the same move cannot be listed twice. A CHECK
// in the database refuses From = To.
public class WorkflowTransition
{
    public int WorkflowId { get; set; }

    public TicketStatus FromStatus { get; set; }

    public TicketStatus ToStatus { get; set; }
}
