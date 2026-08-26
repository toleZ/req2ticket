import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CreateEpicModal } from '@/components/epics/CreateEpicModal'
import { EpicList } from '@/components/epics/EpicList'
import { LoadState } from '@/components/ui/LoadState'
import { createEpic, deleteEpic, getEpics, getStories, updateEpic } from '@/lib/api'

const NEW_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control bg-blue px-3
  py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

export function Epics() {
  const [epics, setEpics] = useState([])
  // The stories are fetched once and each row receives its own already filtered, instead
  // of every row asking /api/epics/{id}/stories for itself.
  const [stories, setStories] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  /* `reloadKey` is the "retry": bumping it by one makes React run the effect below again.
     It is how you repeat a load without pulling the fetch out of the effect.

     The effect does not set loadState to 'loading': the initial state already is, and doing
     it here would trigger one extra render. `handleRetry` does, because there it is the
     response to a click. */
  useEffect(() => {
    Promise.all([getEpics(), getStories()])
      .then(([nextEpics, nextStories]) => {
        setEpics(nextEpics)
        setStories(nextStories)
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [reloadKey])

  function handleRetry() {
    setLoadState('loading')
    setReloadKey(reloadKey + 1)
  }

  // Appends what the POST returns, which already carries the id and code the backend assigned.
  async function handleCreate(values) {
    const created = await createEpic(values)
    setEpics((prev) => [...prev, created])
  }

  async function handleUpdateEpic(epic, patch) {
    await updateEpic(epic, patch)
    setEpics((prev) => prev.map((current) => (current.id === epic.id ? { ...current, ...patch } : current)))
  }

  // The backend cascade-deletes the epic's stories, so they are removed here too:
  // otherwise they would still be counted against an epic that no longer exists.
  async function handleDeleteEpic(epic) {
    await deleteEpic(epic.id)
    setEpics((prev) => prev.filter((current) => current.id !== epic.id))
    setStories((prev) => prev.filter((story) => story.epicId !== epic.id))
  }

  return (
    <section>
      <PageHeader title="Épicas">
        <button type="button" onClick={() => setIsModalOpen(true)} className={NEW_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
          Nueva épica
        </button>
      </PageHeader>

      <LoadState
        state={loadState}
        isEmpty={epics.length === 0}
        loadingText="Cargando épicas…"
        errorText="No se pudieron cargar las épicas."
        emptyText="Todavía no hay épicas cargadas."
        onRetry={handleRetry}
      />

      {loadState === 'ready' && epics.length > 0 && (
        <EpicList
          epics={epics}
          stories={stories}
          onUpdateEpic={handleUpdateEpic}
          onDeleteEpic={handleDeleteEpic}
        />
      )}

      <CreateEpicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />
    </section>
  )
}
