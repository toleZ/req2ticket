import { findOption, TICKET_CANCELLED, TICKET_DONE, TICKET_STATUS_OPTIONS } from '@/lib/options'
import { STATUS_ORDER } from './TicketBreakdown.data'

function sumPoints(tickets) {
  return tickets.reduce((sum, ticket) => sum + ticket.points, 0)
}

/* Rounded down, so a sprint at 99.6% never reads "100%" while something is still open. */
export function percentDone(stats) {
  if (stats.total === 0) return 0
  return Math.floor((stats.completed / stats.total) * 100)
}

/* One entry per status the tickets actually have, in STATUS_ORDER: how many tickets and how
   many points. A status with no tickets is left out, so the legend never lists a "0". */
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
