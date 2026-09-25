import { EPIC_PRIORITY_OPTIONS } from '@/lib/epicOptions'
import { readList } from '@/lib/urlFilters'

/* The Épicas page's filters, in the URL like the Backlog's (lib/backlogFilters.js):
   ?status=active&priority=high,urgent&owner=4&mine=1&sort=priority&q=pagos
   Params and values in English; `NONE` is "nobody owns it". */
export const NONE = 'none'

export const LIST_KEYS = ['status', 'priority', 'owner']

export const SORT_OPTIONS = [
  { value: 'status', label: 'Estado' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'name', label: 'Nombre' },
]

export function readFilters(params) {
  const filters = { q: params.get('q') ?? '', mine: params.get('mine') === '1' }
  LIST_KEYS.forEach((key) => {
    filters[key] = readList(params, key)
  })
  const sort = params.get('sort')
  filters.sort = SORT_OPTIONS.some((option) => option.value === sort) ? sort : 'status'
  return filters
}

export function countActive(filters) {
  const values = LIST_KEYS.reduce((sum, key) => sum + filters[key].length, 0)
  return values + (filters.mine ? 1 : 0) + (filters.q.trim() ? 1 : 0)
}

const rank = (options, value) => options.findIndex((option) => option.value === value)

/* "Estado" puts the work in progress first (active, then backlog, then closed); ties go to
   the most urgent, then alphabetical. */
const STATUS_ORDER = ['active', 'backlog', 'closed']
const byPriority = (a, b) => rank(EPIC_PRIORITY_OPTIONS, b.priority) - rank(EPIC_PRIORITY_OPTIONS, a.priority)
const byName = (a, b) => a.name.localeCompare(b.name, 'es')

export function applyFilters(epics, filters, myId) {
  const term = filters.q.trim().toLowerCase()

  const list = epics.filter((epic) => {
    const text = `${epic.code} ${epic.name} ${epic.description ?? ''}`.toLowerCase()
    if (term && !text.includes(term)) return false
    if (filters.status.length && !filters.status.includes(epic.status)) return false
    if (filters.priority.length && !filters.priority.includes(epic.priority)) return false
    if (filters.owner.length && !filters.owner.includes(epic.ownerId === null ? NONE : String(epic.ownerId))) return false
    if (filters.mine && epic.ownerId !== myId) return false
    return true
  })

  if (filters.sort === 'name') return list.sort(byName)
  if (filters.sort === 'priority') return list.sort((a, b) => byPriority(a, b) || byName(a, b))
  return list.sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || byPriority(a, b) || byName(a, b),
  )
}

