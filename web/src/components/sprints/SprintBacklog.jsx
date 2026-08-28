import { TicketSummaryList } from '@/components/tickets/TicketSummaryList'
import { Badge } from '@/components/ui/Badge'

/**
 * The Backlog block at the foot of the Sprints page: the tickets nobody has put in a
 * sprint yet.
 *
 * Each row opens that ticket's detail modal, which is where its sprint gets set — the copy
 * below used to send you to the Tickets page for that, and no longer needs to.
 *
 * The heading and the count stay visible even with nothing in the backlog, so an empty
 * backlog reads as "none left" rather than as a section that failed to load.
 */
export function SprintBacklog({ tickets, onSelectTicket }) {
  return (
    <div className="mt-6 border-t border-separator pt-4">
      <div className="flex items-center gap-2">
        <h2 className="text-headline text-label">Backlog</h2>
        <Badge tone="neutral">{tickets.length}</Badge>
      </div>
      <p className="mt-1 max-w-prose text-footnote text-label-secondary">
        Tickets sin sprint asignado. Hacé clic en uno para asignarle un sprint.
      </p>

      {tickets.length > 0 && (
        <div className="mt-3">
          <TicketSummaryList tickets={tickets} onSelectTicket={onSelectTicket} />
        </div>
      )}
    </div>
  )
}
