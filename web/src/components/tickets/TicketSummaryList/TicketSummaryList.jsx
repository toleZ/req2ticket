import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Badge } from '@/components/ui/Badge/Badge'
import { findOption } from '@/lib/options'
import { TICKET_STATUS_OPTIONS } from '@/lib/ticketOptions'
import { CODE, ROW, TITLE } from './TicketSummaryList.styles'

/* Same rule as TicketRow: no background on hover. Here the row also reaches the panel's right
   edge, so the grey band crossed the full width to point at something you read on the left. */

/**
 * A compact listing of what a sprint or an epic contains.
 *
 * Each row opens the ticket: `onSelectTicket` arrives from the page, which is the one holding
 * the modal. This component is used in three places (the expanded epic, a sprint's card and
 * the Backlog block), so wiring it here makes all three clickable at once.
 *
 * The rows carry no padding of their own: the hover paints nothing, so there is no box that
 * needs air inside it and the text stays aligned with the rest of the panel.
 */
export function TicketSummaryList({ tickets, onSelectTicket }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {tickets.map((ticket) => {
        const status = findOption(TICKET_STATUS_OPTIONS, ticket.status)

        return (
          <li key={ticket.id}>
            {/* Same as in TicketRow: to ARIA whatever is inside a <button> is decorative, so
                the accessible name has to be here. */}
            <button
              type="button"
              onClick={() => onSelectTicket(ticket)}
              aria-label={`Abrir ${ticket.code}: ${ticket.title}`}
              className={ROW}
            >
              <TicketTypeIcon type={ticket.type} className="size-3.5" />
              <span className={CODE}>{ticket.code}</span>
              <span className={TITLE}>{ticket.title}</span>
              {status && <Badge tone={status.tone}>{status.label}</Badge>}
              <span className="shrink-0 text-caption font-medium text-label-secondary">
                {ticket.points} pts
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
