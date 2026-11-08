import { findOption, isOpenStatus, TICKET_STATUS_OPTIONS } from '@/lib/options'
import { allowedStatuses, statusBlockReason } from '@/lib/workflow'

/* The status selector's options (ENT-3): the current status plus the ones the workflow allows
   from it. Done stays visible but off, with the reason, while the ticket has open children. */
export function statusOptions(ticket, workflow) {
  const reachable = [ticket.status, ...allowedStatuses(workflow, ticket.status)]

  return TICKET_STATUS_OPTIONS.filter((option) => reachable.includes(option.value)).map((option) => {
    const reason = statusBlockReason(ticket, option.value, workflow)
    return { ...option, disabled: Boolean(reason), description: reason ?? undefined }
  })
}

/* "2 de 5 cerrados": how far along a story's (or a bug's) children are. */
export function childrenProgress(children) {
  const closed = children.filter((child) => !isOpenStatus(child.status)).length
  return `${closed} de ${children.length} ${children.length === 1 ? 'cerrado' : 'cerrados'}`
}

export function statusOf(value) {
  return findOption(TICKET_STATUS_OPTIONS, value)
}

/* What the delete confirmation says (FIX-3): the ticket by its code, and everything that goes
   with it by their codes. `descendantCount` counts grandchildren too (a story's bug's fixes). */
export function deleteMessage(ticket) {
  if (ticket.descendantCount === 0) return `Se va a borrar ${ticket.code}. No se puede deshacer.`

  const codes = ticket.children.map((child) => child.code).join(', ')
  const extra = ticket.descendantCount - ticket.children.length
  const tail = extra > 0 ? ` y ${extra} más que cuelgan de ellos` : ''
  const count = ticket.descendantCount === 1 ? 'su hijo' : `sus ${ticket.descendantCount} hijos`

  return `Se va a borrar ${ticket.code}. También ${count}: ${codes}${tail}. No se puede deshacer.`
}
