/* Helpers for list pages whose filters live in the URL (Backlog, Épicas).

   A list filter is a comma-separated param: ?priority=high,critical. `changeParams` uses the
   function form of setSearchParams, which starts from the URL as it is now and not as it was on
   the last render: two quick changes (a chip, then another) would otherwise overwrite each
   other. `replace` is for typing in a search box, so each key does not become a history entry. */
export function readList(params, key) {
  return (params.get(key) ?? '').split(',').filter(Boolean)
}

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
