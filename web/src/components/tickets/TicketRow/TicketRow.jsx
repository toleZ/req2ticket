import { motion } from 'motion/react'

import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS } from '@/lib/epicOptions'
import { layoutGlide } from '@/lib/motion'
import { revealProps } from '@/lib/reveal'
import { findOption } from '@/lib/options'
import { TICKET_PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'
import { CELL, CELL_BADGE, CODE, META, POINTS, ROW, TITLE } from './TicketRow.styles'
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
 *
 * The type is only the icon: the "UH" / "Tarea" badge next to it said the same thing twice
 * and took the room the title needs. The type still reaches screen readers through the label.
 */
export function TicketRow({ ticket, epics, index, revealFrom = null, onSelectTicket }) {
  const priority = findOption(TICKET_PRIORITY_OPTIONS, ticket.priority)
  const type = findOption(TICKET_TYPE_OPTIONS, ticket.type)
  const checklist = checklistProgress(ticket)
  /* The ticket only carries its epic's name; the epic's colour comes from the list. That
     colour is the one the user chose for the epic, so it marks its work everywhere. */
  const epic = epics.find((current) => current.id === ticket.epicId)
  const accent = epic && findOption(ACCENT_COLORS, epic.accentColor)

  /* A button takes its name from its content, but read in DOM order this row is a pile of
     chips ("Login  Sprint 7  2/5  Media  3 pts  JD"). The label says the same things with
     what each one is, in the order they matter. */
  const label = [
    `Abrir ${ticket.code}: ${ticket.title}`,
    type?.label,
    ticket.epicName && `épica ${ticket.epicName}`,
    ticket.sprintName,
    checklist.total > 0 && `checklist ${checklist.done} de ${checklist.total}`,
    priority && `prioridad ${priority.label}`,
    `${ticket.points} pts`,
    ticket.assigneeName ? `asignado a ${ticket.assigneeName}` : 'sin asignar',
  ]
    .filter(Boolean)
    .join(' · ')

  /* `layoutId`: when a sort, a filter or a status change moves this ticket — even into
     another status section — motion glides it from where it was instead of letting it jump.
     `position` animates the move only, never a stretch of the row. */
  return (
    <motion.li
      layout="position"
      layoutId={`ticket-${ticket.id}`}
      transition={layoutGlide}
      {...revealProps(index, revealFrom)}
    >
      <button type="button" onClick={() => onSelectTicket(ticket)} aria-label={label} className={ROW}>
        <TicketTypeIcon type={ticket.type} className="size-4" />

        <span className={CODE}>{ticket.code}</span>

        <span className={TITLE} title={ticket.title}>
          {ticket.title}
        </span>

        <span className={META}>
          <span className={CELL}>
            {ticket.epicName && (
              <Badge tone="neutral" className={cn(CELL_BADGE, 'gap-1.5')}>
                {accent && (
                  <span className={cn('size-2 shrink-0 rounded-full', accent.dotClass)} aria-hidden="true" />
                )}
                <span className="truncate">{ticket.epicName}</span>
              </Badge>
            )}
          </span>

          <span className={CELL}>
            {ticket.sprintName && (
              <Badge tone="neutral" className={CELL_BADGE}>
                <span className="truncate">{ticket.sprintName}</span>
              </Badge>
            )}
          </span>

          <span className={`${CELL} gap-1.5`}>
            {checklist.total > 0 && (
              <>
                <span className="text-caption text-label-secondary">
                  {checklist.done}/{checklist.total}
                </span>
                <ProgressBar value={checklist.done} max={checklist.total} size="sm" decorative className="w-10" />
              </>
            )}
          </span>

          <span className={CELL}>
            {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}
          </span>

          <span className={POINTS}>
            {ticket.points} pts
          </span>

          <Avatar name={ticket.assigneeName} size="sm" />
        </span>
      </button>
    </motion.li>
  )
}
