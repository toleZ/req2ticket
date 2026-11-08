/* No hace falta leer esto para usar los hooks: import them from '@/lib/queries/…' and that's it.

   The one QueryClient of the app (DATA-1): the cache where every request's answer lives, so
   moving between pages does not ask the server again. Three decisions live here:

     staleTime Infinity   data is asked for once and then served from the cache: no refetch on
                          changing page, on coming back to the tab or on reconnecting. It
                          refreshes only after a change, through the helpers in invalidate.js,
                          or when a page reloads. Changes made by someone else show on reload.
                          Exception: a ticket's or an epic's detail is fetched fresh each time it
                          opens (useTicket, useEpic), so a form never starts from an old version.
     retry                only when retrying can help: a dropped connection or a 5xx. A 404
                          (project not found) or a 403 fails the same way every time, so it shows
                          at once.
     a 403 on save   your permissions changed while you were using the app (someone lowered
                     your role): say so, and reload the project so the buttons rearrange. */
import { MutationCache, QueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/Toast/toast'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: (failureCount, error) => (!error?.status || error.status >= 500) && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error?.status !== 403) return

      toast.error('Tus permisos en este proyecto cambiaron.')
      // The project details carry myPermissions: ['projects', pid] has exactly two parts.
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'projects' && query.queryKey.length === 2 })
    },
  }),
})
