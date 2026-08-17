import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { CreateSprintModal } from '@/components/sprints/CreateSprintModal'
import { SprintCard } from '@/components/sprints/SprintCard'
import { Badge } from '@/components/ui/Badge'
import { createSprint, deleteSprint, getSprints, updateSprint } from '@/lib/api'

const CREATE_BUTTON = `inline-flex shrink-0 items-center gap-1.5 rounded-control bg-blue
  px-3 py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110`

export function Sprints() {
  const [sprints, setSprints] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)

  const closeModal = useCallback(() => setIsModalOpen(false), [])

  // No pone loadState en 'loading' acá: el estado inicial ya lo es, y hacerlo de forma
  // síncrona dentro del efecto dispara un render en cascada. `handleRetry` sí lo hace,
  // porque ahí es una respuesta a un click, no el cuerpo del efecto.
  const fetchSprints = useCallback(() => {
    getSprints()
      .then((nextSprints) => {
        setSprints(nextSprints)
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [])

  useEffect(() => {
    fetchSprints()
  }, [fetchSprints])

  function handleRetry() {
    setLoadState('loading')
    fetchSprints()
  }

  // Suma lo que devuelve el POST, que ya viene con el id que asignó el backend.
  async function handleCreate(values) {
    const created = await createSprint(values)
    setSprints((prev) => [...prev, created])
  }

  async function handleUpdateSprint(sprint, patch) {
    await updateSprint(sprint, patch)
    setSprints((prev) => prev.map((s) => (s.id === sprint.id ? { ...s, ...patch } : s)))
  }

  async function handleDeleteSprint(sprint) {
    await deleteSprint(sprint.id)
    setSprints((prev) => prev.filter((s) => s.id !== sprint.id))
  }

  const activeSprint = sprints.find((sprint) => sprint.status === 'active')

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-title1 text-label">Sprints</h1>
          {loadState === 'ready' && (
            <p className="mt-1 text-footnote text-label-secondary">
              {activeSprint ? `${activeSprint.name} en curso · ` : ''}
              {sprints.length} {sprints.length === 1 ? 'sprint en total' : 'sprints en total'}.
            </p>
          )}
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={CREATE_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo sprint
        </button>
      </div>

      {loadState === 'loading' && (
        <p className="mt-4 max-w-prose text-body text-label-secondary">Cargando sprints…</p>
      )}

      {loadState === 'error' && (
        <div className="mt-4 flex items-center gap-3">
          <p className="max-w-prose text-body text-label-secondary">No se pudieron cargar los sprints.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-subheadline font-medium text-blue hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {loadState === 'ready' && sprints.length === 0 && (
        <p className="mt-4 max-w-prose text-body text-label-secondary">
          Todavía no hay sprints planificados.
        </p>
      )}

      {loadState === 'ready' && sprints.length > 0 && (
        <ul className="mt-4 flex flex-col gap-4">
          {sprints.map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              onUpdateSprint={handleUpdateSprint}
              onDeleteSprint={handleDeleteSprint}
            />
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-separator pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-headline text-label">Backlog</h2>
          <Badge tone="neutral">0</Badge>
        </div>
        <p className="mt-1 max-w-prose text-footnote text-label-secondary">
          Tickets sin sprint asignado. Se asignan desde el panel de cada ticket.
        </p>
      </div>

      <CreateSprintModal isOpen={isModalOpen} onClose={closeModal} onCreate={handleCreate} />
    </section>
  )
}
