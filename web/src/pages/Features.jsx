import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { CreateEpicModal } from '@/components/features/CreateEpicModal'
import { EpicRow } from '@/components/features/EpicRow'
import { createEpic, deleteEpic, getEpics, getStories, updateEpic } from '@/lib/api'

const CREATE_BUTTON = `inline-flex shrink-0 items-center gap-1.5 rounded-control bg-blue
  px-3 py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110`

export function Features() {
  const [epics, setEpics] = useState([])
  // Las historias se traen una sola vez y cada fila recibe las suyas ya filtradas, en vez
  // de que cada una pida /api/epics/{id}/stories por su cuenta.
  const [stories, setStories] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)

  const closeModal = useCallback(() => setIsModalOpen(false), [])

  // No pone loadState en 'loading' acá: el estado inicial ya lo es, y hacerlo de forma
  // síncrona dentro del efecto dispara un render en cascada. `handleRetry` sí lo hace,
  // porque ahí es una respuesta a un click, no el cuerpo del efecto.
  const fetchAll = useCallback(() => {
    Promise.all([getEpics(), getStories()])
      .then(([nextEpics, nextStories]) => {
        setEpics(nextEpics)
        setStories(nextStories)
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  function handleRetry() {
    setLoadState('loading')
    fetchAll()
  }

  // Suma lo que devuelve el POST, que ya viene con el id y el código que asignó el backend.
  async function handleCreate(values) {
    const created = await createEpic(values)
    setEpics((prev) => [...prev, created])
  }

  async function handleUpdateEpic(epic, patch) {
    await updateEpic(epic, patch)
    setEpics((prev) => prev.map((e) => (e.id === epic.id ? { ...e, ...patch } : e)))
  }

  // El backend borra en cascada las historias de la épica, así que acá se sacan también:
  // si no, quedarían contadas en una épica que ya no existe.
  async function handleDeleteEpic(epic) {
    await deleteEpic(epic.id)
    setEpics((prev) => prev.filter((e) => e.id !== epic.id))
    setStories((prev) => prev.filter((story) => story.epicId !== epic.id))
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title1 text-label">Funcionalidades</h1>
        <button type="button" onClick={() => setIsModalOpen(true)} className={CREATE_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
          Nueva épica
        </button>
      </div>

      {loadState === 'loading' && (
        <p className="mt-2 max-w-prose text-body text-label-secondary">Cargando funcionalidades…</p>
      )}

      {loadState === 'error' && (
        <div className="mt-2 flex items-center gap-3">
          <p className="max-w-prose text-body text-label-secondary">
            No se pudieron cargar las funcionalidades.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-subheadline font-medium text-blue hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {loadState === 'ready' && epics.length === 0 && (
        <p className="mt-2 max-w-prose text-body text-label-secondary">
          Todavía no hay funcionalidades cargadas.
        </p>
      )}

      {loadState === 'ready' && epics.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {epics.map((epic) => (
            <EpicRow
              key={epic.id}
              epic={epic}
              stories={stories.filter((story) => story.epicId === epic.id)}
              onUpdateEpic={handleUpdateEpic}
              onDeleteEpic={handleDeleteEpic}
            />
          ))}
        </ul>
      )}

      <CreateEpicModal isOpen={isModalOpen} onClose={closeModal} onCreate={handleCreate} />
    </section>
  )
}
