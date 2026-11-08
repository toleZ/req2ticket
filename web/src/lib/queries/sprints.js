import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { completeSprint, createSprint, deleteSprint, getSprints, startSprint, updateSprint } from '@/lib/api/sprints'
import { invalidateAfterSprintSave, invalidateAfterSprintTicketsMoved } from './invalidate'
import { keys } from './keys'

/* The project's sprints, with their counts (ticketCount, openTicketCount, committedPoints). */
export function useSprints(projectId, select) {
  return useQuery({
    queryKey: keys.sprints(projectId),
    queryFn: () => getSprints(projectId),
    enabled: Boolean(projectId),
    select,
  })
}

export function useCreateSprint(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values) => createSprint(projectId, values),
    onSuccess: () => invalidateAfterSprintSave(queryClient, projectId),
  })
}

/* mutate({ sprint, patch }) */
export function useUpdateSprint(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sprint, patch }) => updateSprint(projectId, sprint, patch),
    onSuccess: () => invalidateAfterSprintSave(queryClient, projectId),
  })
}

export function useStartSprint(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sprintId) => startSprint(projectId, sprintId),
    onSuccess: () => invalidateAfterSprintSave(queryClient, projectId),
  })
}

/* mutate({ sprintId, moveOpenTicketsTo }) — null sends the open tickets to the backlog.
   Answers { sprint, movedTickets }. */
export function useCompleteSprint(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sprintId, moveOpenTicketsTo }) => completeSprint(projectId, sprintId, moveOpenTicketsTo),
    onSuccess: () => invalidateAfterSprintTicketsMoved(queryClient, projectId),
  })
}

/* Only a planned sprint can be deleted; its tickets go back to the backlog. */
export function useDeleteSprint(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sprintId) => deleteSprint(projectId, sprintId),
    onSuccess: () => invalidateAfterSprintTicketsMoved(queryClient, projectId),
  })
}
