import { EPIC_PRIORITY_OPTIONS, rankOf } from '@/lib/options'
import { matchesId } from '@/lib/urlFilters'

/* The Épicas page's filters: ?status=active&priority=high,urgent&owner=4&mine=1&sort=priority&q=pagos
   Reading them from the URL is shared with the Backlog (lib/urlFilters.js); what is the
   page's own is which keys it has, how an epic matches them and how the list sorts. */
export const LIST_KEYS = ['status', 'priority', 'owner']

export const SORT_OPTIONS = [
  { value: 'status', label: 'Estado' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'name', label: 'Nombre' },
]

/* "Estado" puts the work in progress first (active, then backlog, then closed); ties go to
   the most urgent, then alphabetical. */
const STATUS_ORDER = ['active', 'backlog', 'closed']
const byPriority = (a, b) => rankOf(EPIC_PRIORITY_OPTIONS, b.priority) - rankOf(EPIC_PRIORITY_OPTIONS, a.priority)
const byName = (a, b) => a.name.localeCompare(b.name, 'es')

export function applyFilters(epics, filters, myId) {
  const term = filters.q.trim().toLowerCase()

  const list = epics.filter((epic) => {
    const text = `${epic.code} ${epic.name} ${epic.description ?? ''}`.toLowerCase()
    if (term && !text.includes(term)) return false
    if (filters.status.length && !filters.status.includes(epic.status)) return false
    if (filters.priority.length && !filters.priority.includes(epic.priority)) return false
    if (filters.owner.length && !matchesId(filters.owner, epic.ownerId)) return false
    if (filters.mine && epic.ownerId !== myId) return false
    return true
  })

  if (filters.sort === 'name') return list.sort(byName)
  if (filters.sort === 'priority') return list.sort((a, b) => byPriority(a, b) || byName(a, b))
  return list.sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || byPriority(a, b) || byName(a, b),
  )
}
