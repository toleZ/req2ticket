import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { DangerZone } from '@/components/settings/DangerZone/DangerZone'
import { ProjectDetailsForm } from '@/components/settings/ProjectDetailsForm/ProjectDetailsForm'
import { WorkflowEditor } from '@/components/settings/WorkflowEditor/WorkflowEditor'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { useCurrentProject } from '@/hooks/useCurrentProject'
import { PERMISSIONS } from '@/lib/permissions'
import { useWorkflow } from '@/lib/queries/workflow'

/**
 * Configuración del proyecto (PAGE-2), opened from the project menu: the project's data, its
 * workflow and the danger zone, each only as far as your permissions go. Your own account is a
 * separate page, Mi cuenta (pages/Account.jsx).
 */
export function Settings() {
  const { projectId, project, can } = useCurrentProject()
  const workflow = useWorkflow(projectId)

  if (!project) return null

  const canArchive = can(PERMISSIONS.PROJECT_ARCHIVE)
  const canDelete = can(PERMISSIONS.PROJECTS_DELETE)

  return (
    <section>
      <PageHeader title="Configuración del proyecto" />

      <ProjectDetailsForm key={project.id} project={project} canEdit={can(PERMISSIONS.PROJECT_EDIT)} />

      {workflow.isSuccess ? (
        <WorkflowEditor
          key={workflow.data?.updatedAt ?? 'none'}
          projectId={projectId}
          workflow={workflow.data}
          canEdit={can(PERMISSIONS.WORKFLOW_EDIT)}
        />
      ) : (
        <LoadState
          state={workflow.isError ? 'error' : 'loading'}
          loadingText="Cargando el workflow…"
          errorText="No se pudo cargar el workflow."
          onRetry={workflow.refetch}
          className="mt-6"
        />
      )}

      {(canArchive || canDelete) && <DangerZone project={project} canArchive={canArchive} canDelete={canDelete} />}
    </section>
  )
}
