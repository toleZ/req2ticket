import { TICKET_CANCELLED, TICKET_DONE } from '@/lib/options'

/* Summary of a set of tickets. The sprint card and the epic row share it: both show the
   same numbers over different slices of the backlog. */

/* Whether a ticket's points add to a sum. A task with a story is part of it, and its points are
   already in the story's: the same rule as the API's committed points (SprintRepository). */
export function countsPoints(ticket) {
  return !(ticket.type === 'task' && ticket.parentId)
}

function pointsOf(tickets) {
  return tickets.filter(countsPoints).reduce((sum, ticket) => sum + (ticket.points ?? 0), 0)
}

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
    // Bugs and fixes have no points, and an unestimated story has null: both count as 0.
    points: pointsOf(counted),
    pointsCompleted: pointsOf(done),
  }
}

/* " (1 cancelado)" / " (3 cancelados)", or nothing. Appended to a count that leaves the
   cancelled tickets out, so the number never looks like it disagrees with the list below it. */
export function cancelledNote(stats) {
  if (stats.cancelled === 0) return ''
  return stats.cancelled === 1 ? ' (1 cancelado)' : ` (${stats.cancelled} cancelados)`
}

/* How many of the ticket's checklist items are ticked, and how many there are. The API already
   counts them on the list (checklistDone / checklistTotal): a story's acceptance criteria, a
   task's checklist, a fix's verification steps. A bug has none, and gets 0 of 0 — the row uses
   that to skip drawing the bar. */
export function checklistProgress(ticket) {
  return { total: ticket.checklistTotal ?? 0, done: ticket.checklistDone ?? 0 }
}
