using Domain.Entities;

namespace Domain.Common;

// What "open" means, said once: anything that is not done or cancelled (DEC-5). The sprint, the
// epic and the parent-child rule all use it.
//
// Queries cannot call this method (EF would not translate it), so they spell out the same two
// comparisons. If this rule ever changes, search for TicketStatus.Cancelled.
public static class TicketRules
{
    public static bool IsOpen(TicketStatus status) =>
        status != TicketStatus.Done && status != TicketStatus.Cancelled;
}
