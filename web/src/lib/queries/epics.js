import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createEpic, deleteEpic, getEpic, getEpics, updateEpic } from '@/lib/api/epics'
import { invalidateAfterEpicDelete, invalidateAfterEpicSave } from './invalidate'
import { keys } from './keys'

/* The project's epics, light (EpicSummary). Filter them with `select`, never with a new key:

       const { data: open = [] } = useEpics(projectId, (epics) => epics.filter((e) => e.status !== 'closed')) */
export function useEpics(projectId, select) {
  return useQuery({
    queryKey: keys.epics(projectId),
    queryFn: () => getEpics(projectId),
    enabled: Boolean(projectId),
    select,
  })
}

/* One epic's detail. While it loads, the row from the list stands in for it (placeholderData),
   so the sheet opens at once with the name and the counts; `isPlaceholderData` says when the
   description is still missing. Always fetched fresh when it opens, like a ticket's detail
   (staleTime 0, gcTime 0: see useTicket). */
export function useEpic(projectId, epicId) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: keys.epic(projectId, epicId),
    queryFn: () => getEpic(projectId, epicId),
    enabled: Boolean(projectId && epicId),
    staleTime: 0,
    gcTime: 0,
    placeholderData: () =>
      queryClient.getQueryData(keys.epics(projectId))?.find((epic) => epic.id === epicId),
  })
}

export function useCreateEpic(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values) => createEpic(projectId, values),
    onSuccess: (epic) => invalidateAfterEpicSave(queryClient, projectId, null, epic),
  })
}

/* mutate({ epic, patch }): `epic` has to be the detail (see updateEpic in lib/api/epics.js). It
   is also the epic as it was, which tells invalidateAfterEpicSave whether the owner changed. */
export function useUpdateEpic(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ epic, patch }) => updateEpic(projectId, epic, patch),
    onSuccess: (epic, { epic: before }) => {
      queryClient.setQueryData(keys.epic(projectId, epic.id), epic)
      invalidateAfterEpicSave(queryClient, projectId, before, epic)
    },
  })
}

export function useDeleteEpic(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (epicId) => deleteEpic(projectId, epicId),
    onSuccess: (_, epicId) => {
      queryClient.removeQueries({ queryKey: keys.epic(projectId, epicId) })
      invalidateAfterEpicDelete(queryClient, projectId)
    },
  })
}
