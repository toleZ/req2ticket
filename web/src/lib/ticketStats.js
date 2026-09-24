import { CHECKLIST_KEY } from '@/lib/ticketExtraFields'
import { TICKET_CANCELLED, TICKET_DONE } from '@/lib/ticketOptions'

/* Summary of a set of tickets. The sprint card and the epic row share it: both show the
   same numbers over different slices of the backlog. */

export function summarizeTickets(tickets) {
  /* Cancelled ones leave the count before anything else: they are neither done nor pending.
     If they counted towards `total`, a sprint with discarded work would never reach 100%.
     They stay visible in the Tickets list, in their own section — what they do not do is
     count here. */
  const counted = tickets.filter((ticket) => ticket.status !== TICKET_CANCELLED)
  const done = counted.filter((ticket) => ticket.status === TICKET_DONE)

  return {
    /* `all` and `cancelled` are for saying so on screen: "2 de 3 (1 cancelado)". Anything
       that asks "does it have tickets?" or deletes them must look at `all`, not `total`. */
    all: tickets.length,
    cancelled: tickets.length - counted.length,
    total: counted.length,
    completed: done.length,
    points: counted.reduce((sum, ticket) => sum + ticket.points, 0),
    pointsCompleted: done.reduce((sum, ticket) => sum + ticket.points, 0),
  }
}

/* " (1 cancelado)" / " (3 cancelados)", or nothing. Appended to a count that leaves the
   cancelled tickets out, so the number never looks like it disagrees with the list below it. */
export function cancelledNote(stats) {
  if (stats.cancelled === 0) return ''
  return stats.cancelled === 1 ? ' (1 cancelado)' : ` (${stats.cancelled} cancelados)`
}

/* How many of the ticket's checklist items are ticked, and how many there are.

   Which list counts depends on the type (CHECKLIST_KEY): a story's acceptance criteria, a
   task's checklist, a fix's verification steps. The bug has none and returns 0 of 0 — the row
   uses that to skip drawing the bar. */
export function checklistProgress(ticket) {
  const key = CHECKLIST_KEY[ticket.type]
  const items = key && ticket.extraFields ? ticket.extraFields[key] : null

  if (!items) return { total: 0, done: 0 }

  return { total: items.length, done: items.filter((item) => item.done).length }
}
