import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Badge } from '@/components/ui/Badge/Badge'
import { findOption, TICKET_STATUS_OPTIONS } from '@/lib/options'
import { revealProps } from '@/lib/reveal'
import { CODE, POINTS, ROW, TITLE } from './TicketSummaryList.styles'

/* Same rule as TicketRow: no background on hover. Here the row also reaches the panel's right
   edge, so the grey band crossed the full width to point at something you read on the left. */

/**
 * A compact listing of tickets: today, the Sprints page's Backlog block (the tickets with no
 * sprint). The expanded epic and sprint rows used to draw it too; they now show
 * TicketBreakdown, whose list borrows this one's look.
 *
 * Each row opens the ticket: `onSelectTicket` arrives from the page, which is the one holding
 * the modal.
 *
 * The rows carry no padding of their own: the hover paints nothing, so there is no box that
 * needs air inside it and the text stays aligned with the rest of the panel.
 */
export function TicketSummaryList({ tickets, revealFrom = null, onSelectTicket }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {tickets.map((ticket, index) => {
        const status = findOption(TICKET_STATUS_OPTIONS, ticket.status)

        return (
          <li key={ticket.id} {...revealProps(index, revealFrom)}>
            {/* Same as in TicketRow: the label reads the row in order, saying what each
                piece is, instead of the chips run together. */}
            <button
              type="button"
              onClick={() => onSelectTicket(ticket)}
              aria-label={[`Abrir ${ticket.code}: ${ticket.title}`, status?.label, `${ticket.points} pts`]
                .filter(Boolean)
                .join(' · ')}
              className={ROW}
            >
              <TicketTypeIcon type={ticket.type} className="size-3.5" />
              <span className={CODE}>{ticket.code}</span>
              <span className={TITLE} title={ticket.title}>
                {ticket.title}
              </span>
              {status && <Badge tone={status.tone}>{status.label}</Badge>}
              <span className={POINTS}>
                {ticket.points} pts
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
