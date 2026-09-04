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
    total: counted.length,
    completed: done.length,
    points: counted.reduce((sum, ticket) => sum + ticket.points, 0),
    pointsCompleted: done.reduce((sum, ticket) => sum + ticket.points, 0),
  }
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
