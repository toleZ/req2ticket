/* No hace falta leer esto para cambiar cómo se ve el tablero: the board calls
   moveTicket.mutate({ ticketId, status }) and the card jumps to its new column at once.

   The only OPTIMISTIC save in the app (BOARD-1, FIX-1). Everywhere else a save goes: ask the
   server → wait → the screen changes. Here it is the other way round: the screen changes first,
   as if the server had already said yes, and the answer only confirms it — or undoes it.

   Why here: without it, a dropped card would go back to its old column while the request
   travels (the cache still says the old status) and then jump to the new one. Locally that is
   20 ms and nobody sees it; deployed it is a few hundred, and it looks broken.

   While the save travels, the board does not let that same card be dragged again (FIX-2: it
   reads `moveTicket.isPending`). */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/Toast/toast'
import { changeTicketStatus } from '@/lib/api/tickets'
import { invalidateAfterStatusChange } from './invalidate'
import { keys } from './keys'

export function useMoveTicket(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    // 1. The request itself: PATCH /tickets/{id}/status.
    mutationFn: ({ ticketId, status }) => changeTicketStatus(projectId, ticketId, status),

    // 2. BEFORE the request leaves:
    onMutate: async ({ ticketId, status }) => {
      // a) Stop any refresh of the list already on its way: arriving after the move, it would
      //    bring the old status back and the card would jump to its old column.
      await queryClient.cancelQueries({ queryKey: keys.tickets(projectId) })

      // b) Keep a copy of the list as it is, in case the move has to be undone.
      const previous = queryClient.getQueryData(keys.tickets(projectId))

      // c) Move the card in the cache NOW: the board redraws with it in the new column.
      queryClient.setQueryData(keys.tickets(projectId), (tickets) =>
        tickets?.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
      )

      // d) What is returned here reaches onError as `context`.
      return { previous }
    },

    // 3. The API said no (workflow, open children, closed epic…):
    onError: (error, _, context) => {
      // Put the list back as it was: the card goes back to its column.
      if (context?.previous) queryClient.setQueryData(keys.tickets(projectId), context.previous)
      // And say why. A 403 is already announced by the global handler (queryClient.js).
      if (error?.status !== 403) toast.error(error.message)
    },

    // 4. Either way, refresh what a status change touches: the tickets, and the epic and
    //    sprint counts.
    onSettled: () => invalidateAfterStatusChange(queryClient, projectId),
  })
}
