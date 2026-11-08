import { FolderPlus } from 'lucide-react'
import { Navigate, useOutletContext } from 'react-router-dom'

import { Button } from '@/components/ui/Button/Button'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { projectPath } from '@/lib/navItems'
import { LAST_PROJECT_PREF } from '@/lib/projectPrefs'
import { useProjects } from '@/lib/queries/projects'
import { readUiPref } from '@/lib/uiPrefs'

/**
 * What "/" shows. With projects, it opens the last one used (or the first). Without any, it
 * says so and offers to create one (ENT-1) — the create sheet itself lives in the shell, which
 * passes `openCreateProject` down through the outlet.
 */
export function HomeRedirect() {
  const { openCreateProject } = useOutletContext()
  const { data: projects, isPending, isError, refetch } = useProjects()

  if (isPending || isError) {
    return (
      <LoadState
        state={isError ? 'error' : 'loading'}
        loadingText="Cargando tus proyectos…"
        errorText="No se pudieron cargar tus proyectos."
        onRetry={refetch}
      />
    )
  }

  const active = projects.filter((project) => !project.isArchived)
  const lastKey = readUiPref(LAST_PROJECT_PREF, null)
  const target = active.find((project) => project.key === lastKey) ?? active[0]

  if (target) return <Navigate to={projectPath(target.key)} replace />

  return (
    <EmptyState
      icon={FolderPlus}
      title="Todavía no sos parte de ningún proyecto"
      description="Creá uno o pedí que te agreguen a uno existente."
      action={<Button onClick={openCreateProject}>Crear proyecto</Button>}
    />
  )
}
