/* Which statuses a ticket can move to, read from the project's workflow (ENT-3). The detail's
   status selector and the board both use this, so they always agree. It only decides what to
   OFFER: the API checks every move again and answers 400 with the reason if it disagrees.

   `workflow` is what GET /workflow answered: { transitions: [{ from, to }] }, or null when the
   project moves freely. */
import { TICKET_DONE, TICKET_STATUS_OPTIONS } from '@/lib/options'

/* The statuses reachable from `from`, in board order. Without a workflow, all the others. */
export function allowedStatuses(workflow, from) {
  if (!workflow) return TICKET_STATUS_OPTIONS.map((option) => option.value).filter((status) => status !== from)

  const targets = workflow.transitions.filter((t) => t.from === from).map((t) => t.to)
  return TICKET_STATUS_OPTIONS.map((option) => option.value).filter((status) => targets.includes(status))
}

/* Why `ticket` cannot move to `to`, in Spanish, or null when it can. The order is the API's:
   the workflow first, then the children. `ticket` needs `status` and `openChildrenCount`
   (both are in the list's summary and in the detail). */
export function statusBlockReason(ticket, to, workflow) {
  if (to === ticket.status) return null

  if (!allowedStatuses(workflow, ticket.status).includes(to)) {
    const from = labelOf(ticket.status)
    return `El workflow no permite pasar de ${from} a ${labelOf(to)}`
  }

  if (to === TICKET_DONE && ticket.openChildrenCount > 0) {
    return ticket.openChildrenCount === 1
      ? 'Tiene 1 hijo abierto'
      : `Tiene ${ticket.openChildrenCount} hijos abiertos`
  }

  return null
}

/* A ticket in done or cancelled with no way out: the selector shows "Estado final" instead. */
export function isFinalStatus(workflow, status) {
  return allowedStatuses(workflow, status).length === 0
}

function labelOf(status) {
  return TICKET_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

/* The template PAGE-2 offers when creating a workflow (ENT-3). */
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
]
