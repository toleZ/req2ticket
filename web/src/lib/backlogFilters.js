import { TICKET_PRIORITY_OPTIONS, rankOf } from '@/lib/options'
import { HAS_POINTS } from '@/lib/ticketTypes'
import { matchesId } from '@/lib/urlFilters'

/* "5 pts" for a row. Bugs and fixes are not estimated, so they show nothing; a story or task
   without an estimate shows "– pts". */
export function pointsText(ticket) {
  if (!HAS_POINTS[ticket.type]) return ''
  return ticket.points === null || ticket.points === undefined ? '– pts' : `${ticket.points} pts`
}

/* The Backlog's filters: ?priority=high,critical&epic=3&mine=1&sort=priority&q=login
   Reading them from the URL is shared with the Épicas page (lib/urlFilters.js); what is
   the Backlog's own is which keys it has and how a ticket matches them. */
export const LIST_KEYS = ['status', 'type', 'priority', 'epic', 'sprint', 'assignee']

export const SORT_OPTIONS = [
  { value: 'status', label: 'Estado' },
  { value: 'priority', label: 'Prioridad' },
]

/* The search matches the title and the code, so "R2T-UH-12" or just "uh-12" finds the ticket. */
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

/* The list's tickets only carry ids (epicId, sprintId, assigneeId). The rows show names, so this
   adds them from the lists the page already has: epicName, sprintName, assigneeName. Any page
   that hands tickets to TicketRow, TicketSummaryList or TicketBreakdown should pass them through
   here first. Missing lists are fine: that name just stays empty. */
export function withTicketNames(tickets, { epics = [], sprints = [], members = [] }) {
  return tickets.map((ticket) => ({
    ...ticket,
    epicName: epics.find((epic) => epic.id === ticket.epicId)?.name ?? null,
    sprintName: sprints.find((sprint) => sprint.id === ticket.sprintId)?.name ?? null,
    assigneeName: members.find((member) => member.id === ticket.assigneeId)?.name ?? null,
  }))
}
