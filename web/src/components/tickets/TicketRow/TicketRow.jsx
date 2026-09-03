import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { findOption } from '@/lib/options'
import { TICKET_PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'
import { CODE, ROW, TITLE } from './TicketRow.styles'
import { checklistProgress } from '@/lib/ticketStats'

/* No background change on hover: the row is already a grey block, and darkening the whole of
   it to say "this can be opened" buried the badges and read as a smudge. It announces itself
   the way a link does — the title underlines and the code climbs a step of grey. */

/**
 * A row in the ticket list: read-only, and clickable end to end.
 *
 * This row used to open into an accordion with three selects inside. You edited in the middle
 * of a list, and only three of a ticket's eleven fields. Now the row reports what is there and
 * TicketDetailModal is what edits.
 *
 * The whole row is the button, not just the code and the title: once the chevron and the bin
 * were gone there is no other control inside, so there are no clicks to disambiguate and no
 * e.stopPropagation() to write. If a button ever comes back in here, this has to go back to
 * being a smaller click area.
 */
export function TicketRow({ ticket, onSelectTicket }) {
  const priority = findOption(TICKET_PRIORITY_OPTIONS, ticket.priority)
  const type = findOption(TICKET_TYPE_OPTIONS, ticket.type)
  const checklist = checklistProgress(ticket)

  return (
    <li>
      {/* The aria-label is not redundant: to ARIA a <button>'s children are decorative, so the
          badges and the progress bar in here are not announced. Without this line a screen
          reader would read "button" and nothing else. */}
      <button
        type="button"
        onClick={() => onSelectTicket(ticket)}
        aria-label={`Abrir ${ticket.code}: ${ticket.title}`}
        className={ROW}
      >
        <TicketTypeIcon type={ticket.type} className="size-4" />

        <span className={CODE}>{ticket.code}</span>

        {type && <Badge tone={type.tone}>{type.short}</Badge>}

        <span className={TITLE}>{ticket.title}</span>

        {ticket.epicName && <Badge tone="neutral">{ticket.epicName}</Badge>}

        {ticket.sprintName && <Badge tone="purple">{ticket.sprintName}</Badge>}

        {checklist.total > 0 && (
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="text-caption text-label-tertiary">
              {checklist.done}/{checklist.total}
            </span>
            <ProgressBar value={checklist.done} max={checklist.total} size="sm" className="w-14" />
          </span>
        )}

        {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}

        <span className="shrink-0 text-caption font-medium text-label-secondary">
          {ticket.points} pts
        </span>

        <Avatar name={ticket.assigneeName} size="sm" />
      </button>
    </li>
  )
}
