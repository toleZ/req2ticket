import { TicketSummaryList } from '@/components/tickets/TicketSummaryList'
import { Badge } from '@/components/ui/Badge'

/**
 * The Backlog block at the foot of the Sprints page: the tickets nobody has put in a
 * sprint yet.
 *
 * Read-only on purpose — a ticket is assigned to a sprint from its own panel, in Tickets.
 * The heading and the count stay visible even with nothing in the backlog, so an empty
 * backlog reads as "none left" rather than as a section that failed to load.
 */
export function SprintBacklog({ tickets }) {
  return (
    <div className="mt-6 border-t border-separator pt-4">
      <div className="flex items-center gap-2">
        <h2 className="text-headline text-label">Backlog</h2>
        <Badge tone="neutral">{tickets.length}</Badge>
      </div>
      <p className="mt-1 max-w-prose text-footnote text-label-secondary">
        Tickets sin sprint asignado. Se asignan desde el panel de cada ticket, en Tickets.
      </p>

      {tickets.length > 0 && (
        <div className="mt-3">
          <TicketSummaryList tickets={tickets} />
        </div>
      )}
    </div>
  )
}
