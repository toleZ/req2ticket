import { TICKET_PRIORITY_OPTIONS, rankOf } from '@/lib/options'
import { matchesId } from '@/lib/urlFilters'

/* The Backlog's filters: ?priority=high,critical&epic=3&mine=1&sort=priority&q=login
   Reading them from the URL is shared with the Épicas page (lib/urlFilters.js); what is
   the Backlog's own is which keys it has and how a ticket matches them. */
export const LIST_KEYS = ['status', 'type', 'priority', 'epic', 'sprint', 'assignee']

export const SORT_OPTIONS = [
  { value: 'status', label: 'Estado' },
  { value: 'priority', label: 'Prioridad' },
]

export function applyFilters(tickets, filters, myId) {
  const term = filters.q.trim().toLowerCase()

  return tickets.filter((ticket) => {
    if (term && !`${ticket.code} ${ticket.title}`.toLowerCase().includes(term)) return false
    if (filters.status.length && !filters.status.includes(ticket.status)) return false
    if (filters.type.length && !filters.type.includes(ticket.type)) return false
    if (filters.priority.length && !filters.priority.includes(ticket.priority)) return false
    if (filters.epic.length && !matchesId(filters.epic, ticket.epicId)) return false
    if (filters.sprint.length && !matchesId(filters.sprint, ticket.sprintId)) return false
    if (filters.assignee.length && !matchesId(filters.assignee, ticket.assigneeId)) return false
    if (filters.mine && ticket.assigneeId !== myId) return false
    return true
  })
}

/* Most urgent first. */
export function byPriority(a, b) {
  return rankOf(TICKET_PRIORITY_OPTIONS, b.priority) - rankOf(TICKET_PRIORITY_OPTIONS, a.priority)
}
