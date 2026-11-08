import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { SPRINT_COMPLETED } from '@/lib/options'
import { PARENT_TYPES } from '@/lib/ticketTypes'

/* What the ticket sheets (create and detail) offer in their pickers. The values are strings,
   like a <select>'s, because that is what the forms keep. */

/* Epics that can receive a ticket: not closed. The one the ticket is already in stays, so the
   picker can still show it. */
export function epicsForTicket(epics, currentEpicId) {
  return epics.filter((epic) => epic.status !== 'closed' || String(epic.id) === String(currentEpicId))
}

/* Sprints that can receive a ticket: not completed (they are history). Same exception. */
export function sprintsForTicket(sprints, currentSprintId) {
  return sprints.filter(
    (sprint) => sprint.status !== SPRINT_COMPLETED || String(sprint.id) === String(currentSprintId),
  )
}

/* The tickets this one may hang from: the right type (PARENT_TYPES) and the same epic. Never
   itself. */
export function parentPickerOptions(tickets, { type, epicId, ticketId }, emptyLabel) {
  const allowed = PARENT_TYPES[type] ?? []
  const candidates = tickets.filter(
    (ticket) =>
      allowed.includes(ticket.type) && String(ticket.epicId) === String(epicId) && ticket.id !== ticketId,
  )

  const options = candidates.map((ticket) => ({
    value: String(ticket.id),
    label: `${ticket.code} · ${ticket.title}`,
    leading: <TicketTypeIcon type={ticket.type} className="size-4" />,
  }))

  return emptyLabel ? [{ value: '', label: emptyLabel }, ...options] : options
}
