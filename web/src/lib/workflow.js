/* Which statuses a ticket can move to, read from the project's workflow (ENT-3). The detail's
   status selector and the board both use this, so they always agree. It only decides what to
   OFFER: the API checks every move again and answers 400 with the reason if it disagrees.

   `workflow` is what GET /workflow answered: { transitions: [{ from, to }] }, or null when the
   project moves freely. */
import { isOpenStatus, SPRINT_COMPLETED, TICKET_STATUS_OPTIONS } from '@/lib/options'

/* The statuses reachable from `from`, in board order. Without a workflow, all the others. */
export function allowedStatuses(workflow, from) {
  if (!workflow) return TICKET_STATUS_OPTIONS.map((option) => option.value).filter((status) => status !== from)

  const targets = workflow.transitions.filter((t) => t.from === from).map((t) => t.to)
  return TICKET_STATUS_OPTIONS.map((option) => option.value).filter((status) => targets.includes(status))
}

/* What the status rules need to know about a ticket besides itself: its parent (to reopen, the
   parent has to be open) and whether its sprint is completed (then its status is history). Built
   from the lists the screen already has. */
export function statusContext(ticket, tickets = [], sprints = []) {
  const parent = ticket.parentId ? tickets.find((current) => current.id === ticket.parentId) : null
  const sprint = ticket.sprintId ? sprints.find((current) => current.id === ticket.sprintId) : null

  return {
    parent: parent ? { code: parent.code, status: parent.status } : null,
    sprintCompleted: sprint?.status === SPRINT_COMPLETED,
  }
}

/* Why `ticket` cannot move to `to`, in Spanish, or null when it can. The order is the API's
   (TicketService.ChangeStatusAsync): the sprint, the workflow, the children, the parent.
   `ticket` needs `status` and `openChildrenCount` (both are in the list's summary and in the
   detail); `context` comes from statusContext. */
export function statusBlockReason(ticket, to, workflow, context = {}) {
  if (to === ticket.status) return null

  if (context.sprintCompleted) return 'Está en un sprint completado'

  if (!allowedStatuses(workflow, ticket.status).includes(to)) {
    return `El workflow no permite pasar de ${labelOf(ticket.status)} a ${labelOf(to)}`
  }

  // Closing — done or cancelled — needs every child closed.
  const closing = isOpenStatus(ticket.status) && !isOpenStatus(to)
  if (closing && ticket.openChildrenCount > 0) {
    return ticket.openChildrenCount === 1
      ? 'Tiene 1 hijo abierto'
      : `Tiene ${ticket.openChildrenCount} hijos abiertos`
  }

  // Reopening needs the parent open: a closed parent never has open children.
  const reopening = !isOpenStatus(ticket.status) && isOpenStatus(to)
  if (reopening && context.parent && !isOpenStatus(context.parent.status)) {
    return `Reabrí primero ${context.parent.code}`
  }

  return null
}

/* A status with no way out under this workflow: once there, the ticket stays. The selector
   shows "Estado final" for it, and moving a ticket into one asks first. */
export function isFinalStatus(workflow, status) {
  return allowedStatuses(workflow, status).length === 0
}

export function labelOf(status) {
  return TICKET_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

/* The template PAGE-2 offers when creating a workflow (ENT-3). Done and cancelled can be
   reopened, so a mistaken click is never final. */
export const DEFAULT_WORKFLOW = [
  { from: 'todo', to: 'inProgress' },
  { from: 'todo', to: 'cancelled' },
  { from: 'inProgress', to: 'todo' },
  { from: 'inProgress', to: 'inReview' },
  { from: 'inProgress', to: 'cancelled' },
  { from: 'inReview', to: 'inProgress' },
  { from: 'inReview', to: 'testing' },
  { from: 'inReview', to: 'cancelled' },
  { from: 'testing', to: 'inReview' },
  { from: 'testing', to: 'done' },
  { from: 'testing', to: 'cancelled' },
  { from: 'done', to: 'inProgress' },
  { from: 'cancelled', to: 'todo' },
]
