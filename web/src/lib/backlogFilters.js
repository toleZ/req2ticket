import { TICKET_PRIORITY_OPTIONS } from '@/lib/ticketOptions'

/* The Backlog's filters live in the URL (?priority=high,critical&epic=3&mine=1), so a reload
   keeps them, a link shares the exact view and Back undoes a change. This file turns the URL
   into filters and filters into the visible tickets; the page only renders.

   Params and their values are in English, like every URL in the app; only the labels are
   Spanish. Each list filter is a comma-separated param. `NONE` stands for "no sprint" /
   "nobody assigned", which have no id of their own. */
export const NONE = 'none'

export const LIST_KEYS = ['status', 'type', 'priority', 'epic', 'sprint', 'assignee']

export const SORT_OPTIONS = [
  { value: 'status', label: 'Estado' },
  { value: 'priority', label: 'Prioridad' },
]

export function readFilters(params) {
  const filters = { q: params.get('q') ?? '', mine: params.get('mine') === '1' }
  LIST_KEYS.forEach((key) => {
    filters[key] = (params.get(key) ?? '').split(',').filter(Boolean)
  })
  filters.sort = params.get('sort') === 'priority' ? 'priority' : 'status'
  return filters
}

/* How many values are active, for "Limpiar N filtros". The order is a view, not a filter. */
export function countActive(filters) {
  const values = LIST_KEYS.reduce((sum, key) => sum + filters[key].length, 0)
  return values + (filters.mine ? 1 : 0) + (filters.q.trim() ? 1 : 0)
}

function matchesId(list, id) {
  return list.includes(id === null ? NONE : String(id))
}

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

/* Priority runs low to high in TICKET_PRIORITY_OPTIONS, so higher index first. */
export function byPriority(a, b) {
  const rank = (priority) => TICKET_PRIORITY_OPTIONS.findIndex((option) => option.value === priority)
  return rank(b.priority) - rank(a.priority)
}
