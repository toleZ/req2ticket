import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS, rankOf } from '@/lib/options'

/* The board's columns, in flow order. Cancelled is not a column: a ticket is cancelled from its
   card's menu, and it leaves the board (it stays in Tickets, in its own section). */
export const BOARD_COLUMNS = TICKET_STATUS_OPTIONS.filter((option) => option.value !== 'cancelled')

export const INITIAL_FILTERS = { mine: false, types: [], epics: [], assignees: [] }

/* Value used by the assignee filter for "nobody assigned", and by the epic filter for "no
   epic": neither has an id of its own. */
export const UNASSIGNED = 'none'
export const NO_EPIC = 'none'

/* The tickets the filters let through. Plain checks on purpose: each filter that is empty lets
   everything through. */
export function filterBoardTickets(tickets, filters, currentUserId) {
  return tickets.filter((ticket) => {
    if (filters.mine && ticket.assigneeId !== currentUserId) return false
    if (filters.types.length > 0 && !filters.types.includes(ticket.type)) return false
    if (filters.epics.length > 0) {
      const epic = ticket.epicId === null ? NO_EPIC : String(ticket.epicId)
      if (!filters.epics.includes(epic)) return false
    }
    if (filters.assignees.length > 0) {
      const assignee = ticket.assigneeId === null ? UNASSIGNED : String(ticket.assigneeId)
      if (!filters.assignees.includes(assignee)) return false
    }
    return true
  })
}

export function countActiveFilters(filters) {
  return filters.types.length + filters.epics.length + filters.assignees.length + (filters.mine ? 1 : 0)
}

/* Inside a column: the most urgent first, then by code — R2T-UH-2 before R2T-UH-10, which is
   what `numeric` is for. Nobody reorders cards by hand (that needs an order field: later). */
export function sortCards(tickets) {
  return [...tickets].sort((a, b) => {
    const byPriority = rankOf(TICKET_PRIORITY_OPTIONS, b.priority) - rankOf(TICKET_PRIORITY_OPTIONS, a.priority)
    if (byPriority !== 0) return byPriority
    return a.code.localeCompare(b.code, 'es', { numeric: true })
  })
}

/* "Quedan 4 días", "Último día", "Terminó hace 2 días". */
export function remainingText(days) {
  if (days > 1) return `Quedan ${days} días`
  if (days === 1) return 'Queda 1 día'
  if (days === 0) return 'Último día'
  return days === -1 ? 'Terminó hace 1 día' : `Terminó hace ${-days} días`
}
