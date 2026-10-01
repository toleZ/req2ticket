import { findOption, TICKET_CANCELLED, TICKET_DONE, TICKET_STATUS_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'
import { STATUS_ORDER } from './EpicBreakdown.data'

function sumPoints(tickets) {
  return tickets.reduce((sum, ticket) => sum + ticket.points, 0)
}

/* Rounded down, so an epic at 99.6% never reads "100%" while something is still open. */
export function percentDone(stats) {
  if (stats.total === 0) return 0
  return Math.floor((stats.completed / stats.total) * 100)
}

/* One entry per status the epic actually has, in STATUS_ORDER: how many tickets and how many
   points. A status with no tickets is left out, so the legend never lists a "0". */
export function statusBreakdown(tickets) {
  return STATUS_ORDER.map((value) => {
    const inStatus = tickets.filter((ticket) => ticket.status === value)
    return {
      value,
      label: findOption(TICKET_STATUS_OPTIONS, value).label,
      count: inStatus.length,
      points: sumPoints(inStatus),
    }
  }).filter((entry) => entry.count > 0)
}

/* What is left to do: neither done nor cancelled, the ones under way first. `sort` keeps the
   original order inside each status, so two "Por hacer" tickets stay as the API sent them. */
export function pendingTickets(tickets) {
  return tickets
    .filter((ticket) => ticket.status !== TICKET_DONE && ticket.status !== TICKET_CANCELLED)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
}

/* Done out of total for each ticket type the epic has. Cancelled ones are out, like in every
   other count (summarizeTickets), so the four rows add up to the figure at the top. */
export function typeBreakdown(tickets) {
  return TICKET_TYPE_OPTIONS.map((type) => ({
    type,
    stats: summarizeTickets(tickets.filter((ticket) => ticket.type === type.value)),
  })).filter((entry) => entry.stats.total > 0)
}
