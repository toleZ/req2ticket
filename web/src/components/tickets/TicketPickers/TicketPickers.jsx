import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { isOpenStatus, SPRINT_COMPLETED } from '@/lib/options'
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

/* The tickets this one may hang from: the right type (PARENT_TYPES) and open — a closed parent
   cannot receive children (the API says the same). Any epic: the child takes its parent's. The
   current parent stays even if it is closed, so the picker can still show it. Never itself. */
export function parentPickerOptions(tickets, { type, ticketId, currentParentId }, emptyLabel) {
  const allowed = PARENT_TYPES[type] ?? []
  const candidates = tickets.filter(
    (ticket) =>
      allowed.includes(ticket.type) &&
      ticket.id !== ticketId &&
      (isOpenStatus(ticket.status) || String(ticket.id) === String(currentParentId)),
  )

  const options = candidates.map((ticket) => ({
    value: String(ticket.id),
    label: `${ticket.code} · ${ticket.title}`,
    leading: <TicketTypeIcon type={ticket.type} className="size-4" />,
  }))

  return emptyLabel ? [{ value: '', label: emptyLabel }, ...options] : options
}

/* Names for the read-only values ("Autenticación · de R2T-UH-3"). */
export function epicName(epics, epicId) {
  return epics.find((epic) => epic.id === epicId)?.name ?? 'Sin épica'
}

export function sprintName(sprints, sprintId) {
  return sprints.find((sprint) => sprint.id === sprintId)?.name ?? 'Sin sprint'
}

/* The parent picked in a form, from the list the sheet already has. Null without one. */
export function parentOf(tickets, parentId) {
  if (!parentId) return null
  return tickets.find((ticket) => String(ticket.id) === String(parentId)) ?? null
}

/* The form after choosing a parent. A child has its parent's epic, and a task its story's sprint
   — the API sets both anyway, the form shows them right away. Clearing the parent leaves the
   epic and the sprint as they were, editable again. */
export function withParent(values, tickets, parentId) {
  const parent = parentOf(tickets, parentId)
  if (!parent) return { ...values, parentId }

  return {
    ...values,
    parentId,
    epicId: parent.epicId ? String(parent.epicId) : '',
    sprintId: values.type === 'task' ? (parent.sprintId ? String(parent.sprintId) : '') : values.sprintId,
  }
}
