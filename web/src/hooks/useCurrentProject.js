import { useParams } from 'react-router-dom'

import { useProject, useProjects } from '@/lib/queries/projects'

/**
 * The project in the address (/p/R2T/…) and what you may do in it. Every page inside a project
 * starts with this:
 *
 *     const { projectId, can } = useCurrentProject()
 *     const { data: tickets = [] } = useTickets(projectId)
 *     {can(PERMISSIONS.TICKETS_WRITE) && <Button>Nuevo ticket</Button>}
 *
 * Pages call it; the components below them get plain props (`readOnly`, `canDelete`…), never the
 * hook. Returns:
 *   projectKey   'R2T', as written in the address
 *   projectId    its id, or undefined while the list of projects loads
 *   project      the detail: name, myRole, myPermissions, isArchived, isSuperAdmin…
 *   can(p)       whether myPermissions includes p (see lib/permissions.js). False while loading.
 *   isArchived   the project is archived: everything is read only, except restoring it
 *   isLoading    still finding out
 *   notFound     no project with that key, or you are not in it
 */
export function useCurrentProject() {
  const { projectKey = '' } = useParams()
  const projects = useProjects()

  const listed = projects.data?.find((project) => project.key === projectKey.toUpperCase())
  const detail = useProject(listed?.id)

  const project = detail.data
  const permissions = project?.myPermissions ?? []

  return {
    projectKey,
    projectId: listed?.id,
    project,
    can: (permission) => permissions.includes(permission),
    isArchived: Boolean(project?.isArchived),
    isLoading: projects.isPending || (Boolean(listed) && detail.isPending),
    notFound: (projects.isSuccess && !listed) || detail.error?.status === 404,
    isError: projects.isError || (detail.isError && detail.error?.status !== 404),
    retry: () => {
      projects.refetch()
      if (listed) detail.refetch()
    },
  }
}
