import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { toast } from '@/components/ui/Toast/toast'
import { errorMessage } from '@/lib/errors'
import { useDeleteProject, useSetProjectArchived } from '@/lib/queries/projects'
import { ACTIONS, DANGER_SECTION, SECTION_INTRO, SECTION_TITLE } from '../Settings.styles'

/**
 * Archiving and deleting the project (PAGE-2). Only drawn for whoever may do one of them: without
 * the permission it does not appear at all, not even disabled.
 *
 * Archiving is reversible but changes everything (read only for everyone), so it asks first.
 * Restoring does not. Deleting is for a SuperAdmin and for good: it asks to type the key (FIX-3).
 */
export function DangerZone({ project, canArchive, canDelete }) {
  const [confirm, setConfirm] = useState(null) // 'archive' | 'delete' | null
  const setArchived = useSetProjectArchived(project.id)
  const deleteProject = useDeleteProject(project.id)
  const navigate = useNavigate()

  async function handleRestore() {
    try {
      await setArchived.mutateAsync(false)
      toast.success(`${project.name} se restauró. Ya se puede editar.`)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  async function handleArchive() {
    await setArchived.mutateAsync(true)
    toast.success(`${project.key} quedó archivado`)
  }

  async function handleDelete() {
    await deleteProject.mutateAsync()
    toast.success(`Se borró ${project.key}`)
    navigate('/', { replace: true })
  }

  return (
    <section className={DANGER_SECTION} aria-labelledby="settings-danger">
      <h2 id="settings-danger" className={SECTION_TITLE}>
        Zona de peligro
      </h2>
      <p className={SECTION_INTRO}>Acciones que afectan a todo el proyecto y a todo su equipo.</p>

      <div className={`${ACTIONS} mt-4`}>
        {canArchive &&
          (project.isArchived ? (
            <Button variant="neutral" onClick={handleRestore} disabled={setArchived.isPending}>
              {setArchived.isPending ? 'Restaurando…' : 'Restaurar proyecto'}
            </Button>
          ) : (
            <Button variant="neutral" onClick={() => setConfirm('archive')}>
              Archivar proyecto
            </Button>
          ))}
        {canDelete && (
          <Button variant="danger" onClick={() => setConfirm('delete')}>
            Borrar proyecto
          </Button>
        )}
      </div>

      <ConfirmModal
        isOpen={confirm === 'archive'}
        title="Archivar el proyecto"
        confirmLabel="Archivar proyecto"
        pendingLabel="Archivando…"
        onClose={() => setConfirm(null)}
        onConfirm={handleArchive}
      >
        <p>
          <strong className="font-semibold text-label">{project.key}</strong> queda en solo lectura para todos. Se
          puede restaurar.
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={confirm === 'delete'}
        title="Borrar el proyecto"
        confirmLabel="Borrar proyecto"
        pendingLabel="Borrando…"
        confirmText={project.key}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
      >
        <p>
          Se borra <strong className="font-semibold text-label">{project.key}</strong> con todas sus épicas, sprints y
          tickets. <strong className="font-semibold text-label">No se puede deshacer.</strong>
        </p>
      </ConfirmModal>
    </section>
  )
}
