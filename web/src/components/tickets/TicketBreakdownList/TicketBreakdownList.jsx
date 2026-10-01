import { useId } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { LIST_LIMIT } from '@/components/tickets/TicketBreakdown/TicketBreakdown.data'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { CODE, POINTS } from '@/components/tickets/TicketSummaryList/TicketSummaryList.styles'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { cn } from '@/lib/cn'
import { findOption, TICKET_CANCELLED, TICKET_STATUS_OPTIONS } from '@/lib/options'
import { revealProps } from '@/lib/reveal'
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
  TITLE_CANCELLED,
} from './TicketBreakdownList.styles'

/**
 * The card under the breakdown's bar: the first few of a set of tickets and the way out to all
 * of them. TicketBreakdown decides which set — the pending ones, or one status chosen from the
 * legend — and passes the `title` and `hint` that say so. `emptyText` is only needed where the
 * set can be empty (nothing pending); a status from the legend always has tickets.
 *
 * A cancelled ticket is drawn struck through and dimmed, like its badge: it is listed (you
 * picked "Cancelado" in the legend), but it is not work anyone is doing.
 *
 * `revealFrom` is lib/reveal's: null keeps the rows still, 0 has them rise in one after
 * another. TicketBreakdown passes 0 once the legend has switched the list, and gives each
 * list its own `key` so the reveal plays again on every switch.
 *
 * `tickets` arrives already filtered and sorted. The rows look like TicketSummaryList's and
 * open the ticket the same way.
 *
 * The Backlog link carries no count on purpose. The Backlog lists the cancelled tickets too,
 * so its number (22) never matched the 20 the rest of the panel counts, and read as an error.
 */
export function TicketBreakdownList({ title, hint, emptyText, tickets, revealFrom = null, backlogHref, onSelectTicket }) {
  const headingId = useId()
  const shown = tickets.slice(0, LIST_LIMIT)
  const hidden = tickets.length - shown.length

  return (
    <section className={CARD} aria-labelledby={headingId}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 id={headingId} className={HEADING}>
          {title}
        </h3>
        {shown.length > 0 && <p className={HINT}>{hint}</p>}
      </div>

      {shown.length === 0 ? (
        <p className={EMPTY}>{emptyText}</p>
      ) : (
        <ul className={LIST}>
          {shown.map((ticket, index) => {
            const status = findOption(TICKET_STATUS_OPTIONS, ticket.status)
            const isCancelled = ticket.status === TICKET_CANCELLED
            const reveal = revealProps(index, revealFrom)

            return (
              <li key={ticket.id} className={cn(ITEM, reveal.className)} style={reveal.style}>
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
                  <span className={cn(TITLE, isCancelled && TITLE_CANCELLED)} title={ticket.title}>
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
        {hidden > 0 && <p className={MORE}>+{hidden} más</p>}
        <Link to={backlogHref} className={LINK}>
          Ver todos en el Backlog
          <ArrowRight className={LINK_ARROW} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
