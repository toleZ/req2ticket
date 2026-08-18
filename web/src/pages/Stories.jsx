import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, Plus, Search } from 'lucide-react'

import { CreateStoryModal } from '@/components/features/CreateStoryModal'
import { StoryRow } from '@/components/features/StoryRow'
import {
  createStory,
  deleteStory,
  getEpics,
  getSprints,
  getStories,
  getUsers,
  updateStory,
} from '@/lib/api'
import { STORY_PRIORITY_OPTIONS, STORY_STATUS_OPTIONS } from '@/lib/storyOptions'

const CREATE_BUTTON = `inline-flex shrink-0 items-center gap-1.5 rounded-control bg-blue
  px-3 py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110`

const SORT_BUTTON = `inline-flex shrink-0 items-center gap-1.5 rounded-control bg-fill-tertiary
  px-3 py-2 text-subheadline font-medium text-label transition-colors duration-fast
  hover:bg-fill-secondary`

const FILTER_SELECT =
  'rounded-control border border-separator bg-fill-tertiary px-2.5 py-1.5 text-footnote text-label'

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

export function Stories() {
  const [stories, setStories] = useState([])
  const [epics, setEpics] = useState([])
  const [users, setUsers] = useState([])
  const [sprints, setSprints] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [epicFilter, setEpicFilter] = useState('')
  const [sprintFilter, setSprintFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortByPriority, setSortByPriority] = useState(false)

  const closeModal = useCallback(() => setIsModalOpen(false), [])

  // No pone loadState en 'loading' acá: el estado inicial ya lo es, y hacerlo de forma
  // síncrona dentro del efecto dispara un render en cascada. `handleRetry` sí lo hace,
  // porque ahí es una respuesta a un click, no el cuerpo del efecto.
  const fetchAll = useCallback(() => {
    Promise.all([getStories(), getEpics(), getUsers(), getSprints()])
      .then(([nextStories, nextEpics, nextUsers, nextSprints]) => {
        setStories(nextStories)
        setEpics(nextEpics)
        setUsers(nextUsers)
        setSprints(nextSprints)
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
    const created = await createStory(values)
    setStories((prev) => [...prev, created])
  }

  // El PUT no devuelve cuerpo, así que el merge es local. Si lo que cambió es el sprint
  // hay que recalcular también su nombre, que es lo que muestra el badge de la fila.
  async function handleUpdateStory(story, patch) {
    await updateStory(story, patch)

    const merged = { ...patch }
    if ('sprintId' in patch) {
      const sprintId = patch.sprintId ? Number(patch.sprintId) : null
      const sprint = sprints.find((s) => s.id === sprintId)
      merged.sprintId = sprintId
      merged.sprintName = sprint ? sprint.name : null
    }

    setStories((prev) => prev.map((s) => (s.id === story.id ? { ...s, ...merged } : s)))
  }

  async function handleDeleteStory(story) {
    await deleteStory(story.id)
    setStories((prev) => prev.filter((s) => s.id !== story.id))
  }

  const filteredStories = useMemo(() => {
    const term = search.trim().toLowerCase()

    return stories.filter((story) => {
      if (term && !story.title.toLowerCase().includes(term)) return false
      if (assigneeFilter && String(story.assigneeId) !== assigneeFilter) return false
      if (epicFilter && String(story.epicId) !== epicFilter) return false
      if (sprintFilter === 'backlog' && story.sprintId !== null) return false
      if (sprintFilter && sprintFilter !== 'backlog' && String(story.sprintId) !== sprintFilter) return false
      if (priorityFilter && story.priority !== priorityFilter) return false
      return true
    })
  }, [stories, search, assigneeFilter, epicFilter, sprintFilter, priorityFilter])

  const columns = useMemo(
    () =>
      STORY_STATUS_OPTIONS.map((status) => {
        const columnStories = filteredStories.filter((story) => story.status === status.value)
        if (sortByPriority) {
          columnStories.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        }
        return { status, stories: columnStories }
      }),
    [filteredStories, sortByPriority],
  )

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-title1 text-label">Historias</h1>
          {loadState === 'ready' && (
            <p className="mt-1 text-footnote text-label-secondary">
              {filteredStories.length} de {stories.length} historias del proyecto.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSortByPriority((value) => !value)}
            aria-pressed={sortByPriority}
            className={SORT_BUTTON}
          >
            <ArrowUpDown className="size-4" aria-hidden="true" />
            Prioridad
          </button>
          <button type="button" onClick={() => setIsModalOpen(true)} className={CREATE_BUTTON}>
            <Plus className="size-4" aria-hidden="true" />
            Nueva historia
          </button>
        </div>
      </div>

      {loadState === 'ready' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex min-w-48 flex-1 items-center gap-2 rounded-control border border-separator bg-fill-tertiary px-2.5 py-1.5">
            <Search className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar historias"
              className="w-full bg-transparent text-footnote text-label placeholder:text-label-tertiary focus:outline-none"
            />
          </div>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className={FILTER_SELECT}
          >
            <option value="">Asignado</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <select value={epicFilter} onChange={(e) => setEpicFilter(e.target.value)} className={FILTER_SELECT}>
            <option value="">Funcionalidad</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.name}
              </option>
            ))}
          </select>

          <select value={sprintFilter} onChange={(e) => setSprintFilter(e.target.value)} className={FILTER_SELECT}>
            <option value="">Sprint</option>
            <option value="backlog">Sin sprint</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={FILTER_SELECT}
          >
            <option value="">Prioridad</option>
            {STORY_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loadState === 'loading' && (
        <p className="mt-2 max-w-prose text-body text-label-secondary">Cargando historias…</p>
      )}

      {loadState === 'error' && (
        <div className="mt-2 flex items-center gap-3">
          <p className="max-w-prose text-body text-label-secondary">No se pudieron cargar las historias.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-subheadline font-medium text-blue hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {loadState === 'ready' && stories.length === 0 && (
        <p className="mt-2 max-w-prose text-body text-label-secondary">Todavía no hay historias cargadas.</p>
      )}

      {loadState === 'ready' && stories.length > 0 && (
        <div className="mt-4 flex flex-col gap-6">
          {columns.map(({ status, stories: columnStories }) => (
            <div key={status.value}>
              <div className="flex items-center gap-2">
                <h2 className="text-subheadline font-medium text-label">{status.label}</h2>
                <span className="rounded-control bg-fill-tertiary px-1.5 py-0.5 text-caption2 font-medium text-label-secondary">
                  {columnStories.length}
                </span>
              </div>

              {columnStories.length === 0 ? (
                <p className="mt-2 text-footnote text-label-tertiary">Sin historias en esta columna.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {columnStories.map((story) => (
                    <StoryRow
                      key={story.id}
                      story={story}
                      sprints={sprints}
                      onUpdateStory={handleUpdateStory}
                      onDeleteStory={handleDeleteStory}
                    />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateStoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={handleCreate}
        epics={epics}
        sprints={sprints}
      />
    </section>
  )
}
