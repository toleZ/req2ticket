import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteWorkflow, getWorkflow, saveWorkflow } from '@/lib/api/workflow'
import { keys } from './keys'

/* { transitions: [{ from, to }] }, or null when the project moves freely. Read it with
   allowedStatuses() and statusBlockReason() from lib/workflow.js. */
export function useWorkflow(projectId) {
  return useQuery({
    queryKey: keys.workflow(projectId),
    queryFn: () => getWorkflow(projectId),
    enabled: Boolean(projectId),
  })
}

export function useSaveWorkflow(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transitions) => saveWorkflow(projectId, transitions),
    onSuccess: (workflow) => queryClient.setQueryData(keys.workflow(projectId), workflow),
  })
}

export function useDeleteWorkflow(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteWorkflow(projectId),
    onSuccess: () => queryClient.setQueryData(keys.workflow(projectId), null),
  })
}
