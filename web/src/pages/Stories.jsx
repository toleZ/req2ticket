import { useEffect, useState } from 'react'
import { ArrowUpDown, Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CreateStoryModal } from '@/components/stories/CreateStoryModal'
import { EditableStoryList } from '@/components/stories/EditableStoryList'
import { StoryFilterBar } from '@/components/stories/StoryFilterBar'
import { LoadState } from '@/components/ui/LoadState'
import {
  createStory,
  deleteStory,
  getEpics,
  getSprints,
  getStories,
  getUsers,
  updateStory,
} from '@/lib/api'
import { NO_SPRINT, STORY_PRIORITY_OPTIONS, STORY_STATUS_OPTIONS } from '@/lib/storyOptions'

const NEW_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control bg-blue px-3
  py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

const SORT_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-fill-tertiary px-3 py-2 text-subheadline font-medium text-label transition-colors
  duration-fast hover:bg-fill-secondary disabled:opacity-50`

/* The order comes from STORY_PRIORITY_OPTIONS, which runs low to high, so the sort
   subtracts the other way round. Deriving it instead of hand-writing a map keeps a newly
   added priority from breaking the ordering silently. */
function priorityRank(priority) {
  return STORY_PRIORITY_OPTIONS.findIndex((option) => option.value === priority)
}

export function Stories() {
  const [stories, setStories] = useState([])
  const [epics, setEpics] = useState([])
  const [users, setUsers] = useState([])
  const [sprints, setSprints] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [epicFilter, setEpicFilter] = useState('')
  const [sprintFilter, setSprintFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortByPriority, setSortByPriority] = useState(false)

  /* `reloadKey` is the "retry": bumping it by one makes React run the effect below again.
     It is how you repeat a load without pulling the fetch out of the effect.

     The effect does not set loadState to 'loading': the initial state already is, and doing
     it here would trigger one extra render. `handleRetry` does, because there it is the
     response to a click. */
  useEffect(() => {
    Promise.all([getStories(), getEpics(), getUsers(), getSprints()])
      .then(([nextStories, nextEpics, nextUsers, nextSprints]) => {
        setStories(nextStories)
        setEpics(nextEpics)
        setUsers(nextUsers)
        setSprints(nextSprints)
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
    const created = await createStory(values)
    setStories((prev) => [...prev, created])
  }

  // The PUT returns no body, so the merge is local. If the sprint is what changed, its name
  // has to be recomputed too, since that is what the row's badge displays.
  async function handleUpdateStory(story, patch) {
    await updateStory(story, patch)

    const merged = { ...patch }
    if ('sprintId' in patch) {
      const sprintId = patch.sprintId ? Number(patch.sprintId) : null
      const sprint = sprints.find((candidate) => candidate.id === sprintId)
      merged.sprintId = sprintId
      merged.sprintName = sprint ? sprint.name : null
    }

    setStories((prev) => prev.map((current) => (current.id === story.id ? { ...current, ...merged } : current)))
  }

  async function handleDeleteStory(story) {
    await deleteStory(story.id)
    setStories((prev) => prev.filter((current) => current.id !== story.id))
  }

  /* Recomputed on every render, and that is fine: a few hundred stories at most.
     <select> values are always strings, which is why the ids are compared with String(). */
  const term = search.trim().toLowerCase()

  const filteredStories = stories.filter((story) => {
    if (term && !story.title.toLowerCase().includes(term)) return false
    if (assigneeFilter && String(story.assigneeId) !== assigneeFilter) return false
    if (epicFilter && String(story.epicId) !== epicFilter) return false
    if (sprintFilter === NO_SPRINT && story.sprintId !== null) return false
    if (sprintFilter && sprintFilter !== NO_SPRINT && String(story.sprintId) !== sprintFilter) {
      return false
    }
    if (priorityFilter && story.priority !== priorityFilter) return false
    return true
  })

  /* One section per status, in the order of STORY_STATUS_OPTIONS. */
  const sections = STORY_STATUS_OPTIONS.map((status) => {
    const sectionStories = filteredStories.filter((story) => story.status === status.value)
    if (sortByPriority) {
      sectionStories.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    }
    return { status, stories: sectionStories }
  })

  const subtitle =
    loadState === 'ready'
      ? `${filteredStories.length} de ${stories.length} historias del proyecto.`
      : null

  return (
    <section>
      <PageHeader title="Historias" subtitle={subtitle}>
        <button
          type="button"
          onClick={() => setSortByPriority(!sortByPriority)}
          aria-pressed={sortByPriority}
          className={SORT_BUTTON}
        >
          <ArrowUpDown className="size-4" aria-hidden="true" />
          Prioridad
        </button>
        <button type="button" onClick={() => setIsModalOpen(true)} className={NEW_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
          Nueva historia
        </button>
      </PageHeader>

      {loadState === 'ready' && (
        <StoryFilterBar
          users={users}
          epics={epics}
          sprints={sprints}
          search={search}
          onSearchChange={setSearch}
          assigneeFilter={assigneeFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          epicFilter={epicFilter}
          onEpicFilterChange={setEpicFilter}
          sprintFilter={sprintFilter}
          onSprintFilterChange={setSprintFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />
      )}

      <LoadState
        state={loadState}
        isEmpty={stories.length === 0}
        loadingText="Cargando historias…"
        errorText="No se pudieron cargar las historias."
        emptyText="Todavía no hay historias cargadas."
        onRetry={handleRetry}
      />

      {/* There are stories loaded but the filters left none. Different from the empty list
          above: here what needs changing are the filters. */}
      {loadState === 'ready' && stories.length > 0 && filteredStories.length === 0 && (
        <p className="mt-2 max-w-prose text-body text-label-secondary">
          Ninguna historia coincide con los filtros.
        </p>
      )}

      {loadState === 'ready' && filteredStories.length > 0 && (
        <EditableStoryList
          sections={sections}
          sprints={sprints}
          onUpdateStory={handleUpdateStory}
          onDeleteStory={handleDeleteStory}
        />
      )}

      <CreateStoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        epics={epics}
        sprints={sprints}
      />
    </section>
  )
}
