import { TICKET_TYPE_OPTIONS } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'

/* Done out of total for each ticket type the epic has. Cancelled ones are out, like in every
   other count (summarizeTickets), so the rows add up to the figure at the top. */
export function typeBreakdown(tickets) {
  return TICKET_TYPE_OPTIONS.map((type) => ({
    type,
    stats: summarizeTickets(tickets.filter((ticket) => ticket.type === type.value)),
  })).filter((entry) => entry.stats.total > 0)
}
