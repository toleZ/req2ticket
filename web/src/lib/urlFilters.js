/* Helpers for list pages whose filters live in the URL (Backlog, Épicas), so a reload keeps
   them, a link shares the exact view and Back undoes a change. What each page filters on and
   how it sorts lives in its own file (backlogFilters.js, epicFilters.js); what they share
   is here.

   Params and their values are in English, like every URL in the app; only the labels are
   Spanish. A list filter is a comma-separated param: ?priority=high,critical. `NONE` stands
   for "no sprint" / "nobody assigned" / "nobody owns it", which have no id of their own. */
export const NONE = 'none'

export function readList(params, key) {
  return (params.get(key) ?? '').split(',').filter(Boolean)
}

/* The URL as filters: the search box, "solo lo mío", one list per key in `listKeys`, and the
   sort — which falls back to the first of `sortOptions` when the URL has none or a stale one. */
export function readFilters(params, listKeys, sortOptions) {
  const filters = { q: params.get('q') ?? '', mine: params.get('mine') === '1' }
  listKeys.forEach((key) => {
    filters[key] = readList(params, key)
  })
  const sort = params.get('sort')
  filters.sort = sortOptions.some((option) => option.value === sort) ? sort : sortOptions[0].value
  return filters
}

/* How many values are active, for "Limpiar N filtros". The order is a view, not a filter. */
export function countActive(filters, listKeys) {
  const values = listKeys.reduce((sum, key) => sum + filters[key].length, 0)
  return values + (filters.mine ? 1 : 0) + (filters.q.trim() ? 1 : 0)
}

/* Whether a nullable id (epicId, sprintId, assigneeId, ownerId) is among the chosen values. */
export function matchesId(list, id) {
  return list.includes(id === null ? NONE : String(id))
}

/* `changeParams` uses the function form of setSearchParams, which starts from the URL as it is
   now and not as it was on the last render: two quick changes (a chip, then another) would
   otherwise overwrite each other. `replace` is for typing in a search box, so each key does not
   become a history entry. */
export function changeParams(setParams, change, replace = false) {
  setParams(
    (current) => {
      const next = new URLSearchParams(current)
      change(next)
      return next
    },
    { replace },
  )
}

export function setListParam(next, key, values) {
  if (values.length) next.set(key, values.join(','))
  else next.delete(key)
}
