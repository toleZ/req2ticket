import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { changeTicketStatus, createTicket, deleteTicket, getTicket, getTickets, updateTicket } from '@/lib/api/tickets'
import { invalidateAfterStatusChange, invalidateAfterTicketCreatedOrDeleted, invalidateAfterTicketUpdate } from './invalidate'
import { keys } from './keys'

/* The project's tickets, light (TicketSummary). There is ONE list per project, and every screen
   reads from it: the Backlog, the board (filtered to the active sprint), an epic's tickets.
   Filter with `select`, never with a new key:

       const { data: board = [] } = useTickets(projectId, (tickets) => tickets.filter((t) => t.sprintId === sprintId)) */
export function useTickets(projectId, select) {
  return useQuery({
    queryKey: keys.tickets(projectId),
    queryFn: () => getTickets(projectId),
    enabled: Boolean(projectId),
    select,
  })
}

/* One ticket's detail (description, type fields, children). While it loads, its row from the
   list stands in (placeholderData), so the sheet opens at once with title, status and code.
   `isPlaceholderData` is true until the rest has arrived — don't build an edit form before.

   Unlike the lists, a detail is always fetched fresh when it opens: staleTime 0, and gcTime 0
   so no copy is kept after the sheet closes. The form is built from what the API has right now,
   not from a version someone else may have changed since — saving it would overwrite them. */
export function useTicket(projectId, ticketId) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: keys.ticket(projectId, ticketId),
    queryFn: () => getTicket(projectId, ticketId),
    enabled: Boolean(projectId && ticketId),
    staleTime: 0,
    gcTime: 0,
    placeholderData: () =>
      queryClient.getQueryData(keys.tickets(projectId))?.find((ticket) => ticket.id === ticketId),
  })
}

export function useCreateTicket(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values) => createTicket(projectId, values),
    onSuccess: (ticket) => {
      queryClient.setQueryData(keys.ticket(projectId, ticket.id), ticket)
      invalidateAfterTicketCreatedOrDeleted(queryClient, projectId, ticket.parentId)
    },
  })
}

/* mutate({ ticketId, values }) — `values` complete, built with ticketToFormValues(detail).
   onMutate keeps the detail as it was before saving, so onSuccess can tell what changed. */
export function useUpdateTicket(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, values }) => updateTicket(projectId, ticketId, values),
    onMutate: ({ ticketId }) => ({ before: queryClient.getQueryData(keys.ticket(projectId, ticketId)) }),
    onSuccess: (ticket, _, context) => {
      queryClient.setQueryData(keys.ticket(projectId, ticket.id), ticket)
      invalidateAfterTicketUpdate(queryClient, projectId, context?.before, ticket)
    },
  })
}

/* mutate({ ticketId, status }). Waits for the API, like every save outside the board. The
   board has its own optimistic version: useMoveTicket in lib/queries/board.js. */
export function useChangeTicketStatus(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, status }) => changeTicketStatus(projectId, ticketId, status),
    onSuccess: (ticket) => {
      queryClient.setQueryData(keys.ticket(projectId, ticket.id), ticket)
      invalidateAfterStatusChange(queryClient, projectId)
    },
  })
}

export function useDeleteTicket(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId) => deleteTicket(projectId, ticketId),
    onSuccess: (_, ticketId) => {
      queryClient.removeQueries({ queryKey: keys.ticket(projectId, ticketId) })
      invalidateAfterTicketCreatedOrDeleted(queryClient, projectId)
    },
  })
}
