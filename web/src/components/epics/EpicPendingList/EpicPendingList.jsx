import { useId } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { PENDING_LIMIT } from '@/components/epics/EpicBreakdown/EpicBreakdown.data'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { CODE, POINTS } from '@/components/tickets/TicketSummaryList/TicketSummaryList.styles'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { cn } from '@/lib/cn'
import { findOption, TICKET_STATUS_OPTIONS } from '@/lib/options'
import {
  ASSIGNEE_COLUMN,
  CARD,
  CODE_COLUMN,
  EMPTY,
  FOOTER,
  HEADING,
  HINT,
  ITEM,
  LINK,
  LINK_ARROW,
  LIST,
  MORE,
  POINTS_COLUMN,
  ROW,
  STATUS_COLUMN,
  TITLE,
} from './EpicPendingList.styles'

/**
 * The first few tickets still open in an epic, under way first, and the way out to all of them.
 *
 * `tickets` arrives already filtered and sorted (pendingTickets). The rows look like
 * TicketSummaryList's and open the ticket the same way.
 *
 * The Backlog link carries no count on purpose. The Backlog lists the cancelled tickets too,
 * so its number (22) never matched the 20 the rest of the panel counts, and read as an error.
 */
export function EpicPendingList({ epicId, tickets, onSelectTicket }) {
  const headingId = useId()
  const shown = tickets.slice(0, PENDING_LIMIT)
  const hidden = tickets.length - shown.length

  return (
    <section className={CARD} aria-labelledby={headingId}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 id={headingId} className={HEADING}>
          Pendientes
        </h3>
        {shown.length > 0 && <p className={HINT}>En curso primero, luego por hacer</p>}
      </div>

      {shown.length === 0 ? (
        <p className={EMPTY}>No queda nada pendiente: todo está hecho o cancelado.</p>
      ) : (
        <ul className={LIST}>
          {shown.map((ticket) => {
            const status = findOption(TICKET_STATUS_OPTIONS, ticket.status)

            return (
              <li key={ticket.id} className={ITEM}>
                <button
                  type="button"
                  onClick={() => onSelectTicket(ticket)}
                  aria-label={[
                    `Abrir ${ticket.code}: ${ticket.title}`,
                    status?.label,
                    ticket.assigneeName ? `asignado a ${ticket.assigneeName}` : 'sin asignar',
                    `${ticket.points} pts`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  className={ROW}
                >
                  <TicketTypeIcon type={ticket.type} className="size-3.5" />
                  <span className={cn(CODE, CODE_COLUMN)}>{ticket.code}</span>
                  <span className={TITLE} title={ticket.title}>
                    {ticket.title}
                  </span>
                  {/* An empty span when the status is unknown, so the grid keeps its columns. */}
                  <span className={STATUS_COLUMN}>
                    {status && <Badge tone={status.tone}>{status.label}</Badge>}
                  </span>
                  <Avatar name={ticket.assigneeName} size="sm" className={ASSIGNEE_COLUMN} />
                  <span className={cn(POINTS, POINTS_COLUMN)}>{ticket.points} pts</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className={FOOTER}>
        {hidden > 0 && <p className={MORE}>y {hidden} pendientes más</p>}
        <Link to={`/backlog?epic=${epicId}`} className={LINK}>
          Ver todos en el Backlog
          <ArrowRight className={LINK_ARROW} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
