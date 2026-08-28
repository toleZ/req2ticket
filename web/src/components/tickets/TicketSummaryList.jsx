import { Badge } from '@/components/ui/Badge'
import { findOption } from '@/lib/options'
import { TICKET_STATUS_OPTIONS } from '@/lib/ticketOptions'

/* Compact, read-only listing of what a sprint or an epic contains. */
export function TicketSummaryList({ tickets }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {tickets.map((ticket) => {
        const status = findOption(TICKET_STATUS_OPTIONS, ticket.status)

        return (
          <li key={ticket.id} className="flex items-center gap-2">
            <span className="shrink-0 text-caption text-label-tertiary">{ticket.code}</span>
            <span className="min-w-0 flex-1 truncate text-footnote text-label">{ticket.title}</span>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            <span className="shrink-0 text-caption font-medium text-label-secondary">
              {ticket.points} pts
            </span>
          </li>
        )
      })}
    </ul>
  )
}
