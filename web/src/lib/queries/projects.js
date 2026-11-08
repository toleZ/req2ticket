import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  archiveProject,
  createProject,
  deleteProject,
  getProject,
  getProjects,
  unarchiveProject,
  updateProject,
} from '@/lib/api/projects'
import { invalidateAfterProjectChange } from './invalidate'
import { keys } from './keys'

/* My projects (every one, for a SuperAdmin), archived ones included: an archived project still
   opens, read only, so its Admin can restore it. The selector hides them (`isArchived`). */
export function useProjects() {
  return useQuery({ queryKey: keys.projects, queryFn: () => getProjects({ includeArchived: true }) })
}

/* The open project, with myRole and myPermissions. `enabled` waits until we know its id. */
export function useProject(projectId) {
  return useQuery({
    queryKey: keys.project(projectId),
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.setQueryData(keys.project(project.id), project)
      queryClient.invalidateQueries({ queryKey: keys.projects })
    },
  })
}

export function useUpdateProject(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values) => updateProject(projectId, values),
    onSuccess: (project) => {
      queryClient.setQueryData(keys.project(projectId), project)
      invalidateAfterProjectChange(queryClient)
    },
  })
}

/* Archive or restore: `archived` true or false. */
export function useSetProjectArchived(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (archived) => (archived ? archiveProject(projectId) : unarchiveProject(projectId)),
    onSuccess: (project) => {
      queryClient.setQueryData(keys.project(projectId), project)
      invalidateAfterProjectChange(queryClient)
    },
  })
}

export function useDeleteProject(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: keys.project(projectId) })
      queryClient.invalidateQueries({ queryKey: keys.projects })
    },
  })
}
