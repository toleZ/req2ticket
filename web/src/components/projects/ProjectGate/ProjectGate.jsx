import { Fragment, useEffect } from 'react'
import { Archive, FolderX } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { Banner } from '@/components/ui/Banner/Banner'
import { Button } from '@/components/ui/Button/Button'
import { BASE, SIZE_CLASSES, VARIANT_CLASSES } from '@/components/ui/Button/Button.styles'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { toast } from '@/components/ui/Toast/toast'
import { useCurrentProject } from '@/hooks/useCurrentProject'
import { errorMessage } from '@/lib/errors'
import { PERMISSIONS } from '@/lib/permissions'
import { LAST_PROJECT_PREF } from '@/lib/projectPrefs'
import { useSetProjectArchived } from '@/lib/queries/projects'
import { writeUiPref } from '@/lib/uiPrefs'

/**
 * The door to every page of a project (/p/:projectKey/…). It waits until it knows the project,
 * says so plainly when the key does not exist or is not yours, and remembers it as the last
 * project used, which is where "/" goes next time.
 *
 * The pages below are remounted when the project changes (the Fragment's key): whatever was
 * open — a ticket's sheet, a filter — belonged to the other project.
 *
 * An archived project still opens, read only for everyone (its permissions already say so), with
 * a banner that stays while it lasts — and "Restaurar" for whoever may.
 */
export function ProjectGate() {
  const { projectKey, projectId, project, can, isArchived, isLoading, notFound, isError, retry } = useCurrentProject()
  const setArchived = useSetProjectArchived(projectId)

  async function handleRestore() {
    try {
      await setArchived.mutateAsync(false)
      toast.success(`${project.name} se restauró. Ya se puede editar.`)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  // Not state: it only writes the preference, so nothing re-renders.
  useEffect(() => {
    if (projectId) writeUiPref(LAST_PROJECT_PREF, projectKey.toUpperCase())
  }, [projectId, projectKey])

  if (notFound) {
    return (
      <EmptyState
        icon={FolderX}
        title="Este proyecto no existe o no tenés acceso"
        description="Pedile a un Admin del proyecto que te agregue, o volvé a tus proyectos."
        action={
          <Link to="/" className={`${BASE} ${SIZE_CLASSES.md} ${VARIANT_CLASSES.primary}`}>
            Ir a mis proyectos
          </Link>
        }
      />
    )
  }

  if (isLoading || isError) {
    return (
      <LoadState
        state={isError ? 'error' : 'loading'}
        loadingText="Cargando el proyecto…"
        errorText="No se pudo cargar el proyecto."
        onRetry={retry}
      />
    )
  }

  return (
    <Fragment key={projectId}>
      {isArchived && (
        <Banner
          icon={Archive}
          title="Proyecto archivado: solo lectura"
          className="mb-6"
          action={
            can(PERMISSIONS.PROJECT_ARCHIVE) && (
              <Button size="sm" variant="neutral" onClick={handleRestore} disabled={setArchived.isPending}>
                {setArchived.isPending ? 'Restaurando…' : 'Restaurar'}
              </Button>
            )
          }
        >
          Se puede ver todo, pero nadie puede hacer cambios hasta que se restaure.
        </Banner>
      )}
      <Outlet />
    </Fragment>
  )
}
