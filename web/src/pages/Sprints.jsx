import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CreateSprintModal } from '@/components/sprints/CreateSprintModal'
import { SprintBacklog } from '@/components/sprints/SprintBacklog'
import { SprintList } from '@/components/sprints/SprintList'
import { LoadState } from '@/components/ui/LoadState'
import { createSprint, deleteSprint, getSprints, getStories, updateSprint } from '@/lib/api'
import { SPRINT_ACTIVE } from '@/lib/sprintOptions'

const NEW_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control bg-blue px-3
  py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

export function Sprints() {
  const [sprints, setSprints] = useState([])
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
    Promise.all([getSprints(), getStories()])
      .then(([nextSprints, nextStories]) => {
        setSprints(nextSprints)
        setStories(nextStories)
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }, [reloadKey])

  function handleRetry() {
    setLoadState('loading')
    setReloadKey(reloadKey + 1)
  }

  // Appends what the POST returns, which already carries the id the backend assigned.
  async function handleCreate(values) {
    const created = await createSprint(values)
    setSprints((prev) => [...prev, created])
  }

  async function handleUpdateSprint(sprint, patch) {
    await updateSprint(sprint, patch)
    setSprints((prev) => prev.map((current) => (current.id === sprint.id ? { ...current, ...patch } : current)))
  }

  // The backend leaves the deleted sprint's stories without a sprint (SetNull), so the same
  // has to happen here: they go back to the backlog instead of disappearing.
  async function handleDeleteSprint(sprint) {
    await deleteSprint(sprint.id)
    setSprints((prev) => prev.filter((current) => current.id !== sprint.id))
    setStories((prev) =>
      prev.map((story) =>
        story.sprintId === sprint.id ? { ...story, sprintId: null, sprintName: null } : story,
      ),
    )
  }

  const activeSprint = sprints.find((sprint) => sprint.status === SPRINT_ACTIVE)
  const backlogStories = stories.filter((story) => story.sprintId === null)

  const activeText = activeSprint ? `${activeSprint.name} en curso · ` : ''
  const countText =
    sprints.length === 1 ? '1 sprint en total' : `${sprints.length} sprints en total`
  const subtitle = loadState === 'ready' ? `${activeText}${countText}.` : null

  return (
    <section>
      <PageHeader title="Sprints" subtitle={subtitle}>
        <button type="button" onClick={() => setIsModalOpen(true)} className={NEW_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo sprint
        </button>
      </PageHeader>

      {/* mt-4 rather than the default mt-2: the card list below it needs more room to breathe. */}
      <LoadState
        state={loadState}
        isEmpty={sprints.length === 0}
        loadingText="Cargando sprints…"
        errorText="No se pudieron cargar los sprints."
        emptyText="Todavía no hay sprints planificados."
        onRetry={handleRetry}
        className="mt-4"
      />

      {loadState === 'ready' && sprints.length > 0 && (
        <SprintList
          sprints={sprints}
          stories={stories}
          onUpdateSprint={handleUpdateSprint}
          onDeleteSprint={handleDeleteSprint}
        />
      )}

      {loadState === 'ready' && <SprintBacklog stories={backlogStories} />}

      <CreateSprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />
    </section>
  )
}
