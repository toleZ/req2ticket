/* Several queries as the one state LoadState understands, for the pages that need more than one
   list at once (the Backlog needs tickets, epics, sprints and members):

       const tickets = useTickets(projectId)
       const epics = useEpics(projectId)
       const state = loadStateOf(tickets, epics)        // 'loading' | 'error' | 'ready'
       <LoadState state={state} onRetry={() => retryAll(tickets, epics)} … />

   'loading' only on the first load. A refresh behind the scenes keeps the page as it is: no
   flash of "Cargando…" over data that is already on screen. */
export function loadStateOf(...queries) {
  if (queries.some((query) => query.isError && query.data === undefined)) return 'error'
  if (queries.some((query) => query.isPending)) return 'loading'
  return 'ready'
}

export function retryAll(...queries) {
  queries.forEach((query) => {
    if (query.isError) query.refetch()
  })
}
