import { useEffect, useState } from 'react'
import { ArrowUpDown, Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal'
import { EditableTicketList } from '@/components/tickets/EditableTicketList'
import { TicketFilterBar } from '@/components/tickets/TicketFilterBar'
import { LoadState } from '@/components/ui/LoadState'
import {
  createTicket,
  deleteTicket,
  getEpics,
  getSprints,
  getTickets,
  getUsers,
  updateTicket,
} from '@/lib/api'
import { NO_SPRINT, TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from '@/lib/ticketOptions'

const NEW_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control bg-blue px-3
  py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

const SORT_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-fill-tertiary px-3 py-2 text-subheadline font-medium text-label transition-colors
  duration-fast hover:bg-fill-secondary disabled:opacity-50`

/* The order comes from TICKET_PRIORITY_OPTIONS, which runs low to high, so the sort
   subtracts the other way round. Deriving it instead of hand-writing a map keeps a newly
   added priority from breaking the ordering silently. */
function priorityRank(priority) {
  return TICKET_PRIORITY_OPTIONS.findIndex((option) => option.value === priority)
}

export function Tickets() {
  const [tickets, setTickets] = useState([])
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
  const [typeFilter, setTypeFilter] = useState('')
  const [sortByPriority, setSortByPriority] = useState(false)

  /* `reloadKey` is the "retry": bumping it by one makes React run the effect below again.
     It is how you repeat a load without pulling the fetch out of the effect.

     The effect does not set loadState to 'loading': the initial state already is, and doing
     it here would trigger one extra render. `handleRetry` does, because there it is the
     response to a click. */
  useEffect(() => {
    Promise.all([getTickets(), getEpics(), getUsers(), getSprints()])
      .then(([nextTickets, nextEpics, nextUsers, nextSprints]) => {
        setTickets(nextTickets)
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
    const created = await createTicket(values)
    setTickets((prev) => [...prev, created])
  }

  // The PUT returns no body, so the merge is local. If the sprint is what changed, its name
  // has to be recomputed too, since that is what the row's badge displays.
  async function handleUpdateTicket(ticket, patch) {
    await updateTicket(ticket, patch)

    const merged = { ...patch }
    if ('sprintId' in patch) {
      const sprintId = patch.sprintId ? Number(patch.sprintId) : null
      const sprint = sprints.find((candidate) => candidate.id === sprintId)
      merged.sprintId = sprintId
      merged.sprintName = sprint ? sprint.name : null
    }

    setTickets((prev) => prev.map((current) => (current.id === ticket.id ? { ...current, ...merged } : current)))
  }

  async function handleDeleteTicket(ticket) {
    await deleteTicket(ticket.id)
    setTickets((prev) => prev.filter((current) => current.id !== ticket.id))
  }

  /* Recomputed on every render, and that is fine: a few hundred tickets at most.
     <select> values are always strings, which is why the ids are compared with String(). */
  const term = search.trim().toLowerCase()

  const filteredTickets = tickets.filter((ticket) => {
    if (term && !ticket.title.toLowerCase().includes(term)) return false
    if (assigneeFilter && String(ticket.assigneeId) !== assigneeFilter) return false
    if (epicFilter && String(ticket.epicId) !== epicFilter) return false
    if (sprintFilter === NO_SPRINT && ticket.sprintId !== null) return false
    if (sprintFilter && sprintFilter !== NO_SPRINT && String(ticket.sprintId) !== sprintFilter) {
      return false
    }
    if (priorityFilter && ticket.priority !== priorityFilter) return false
    if (typeFilter && ticket.type !== typeFilter) return false
    return true
  })

  /* One section per status, in the order of TICKET_STATUS_OPTIONS. */
  const sections = TICKET_STATUS_OPTIONS.map((status) => {
    const sectionTickets = filteredTickets.filter((ticket) => ticket.status === status.value)
    if (sortByPriority) {
      sectionTickets.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    }
    return { status, tickets: sectionTickets }
  })

  const subtitle =
    loadState === 'ready'
      ? `${filteredTickets.length} de ${tickets.length} tickets del proyecto.`
      : null

  return (
    <section>
      <PageHeader title="Tickets" subtitle={subtitle}>
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
          Nuevo ticket
        </button>
      </PageHeader>

      {loadState === 'ready' && (
        <TicketFilterBar
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
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      )}

      <LoadState
        state={loadState}
        isEmpty={tickets.length === 0}
        loadingText="Cargando tickets…"
        errorText="No se pudieron cargar los tickets."
        emptyText="Todavía no hay tickets cargados."
        onRetry={handleRetry}
      />

      {/* There are tickets loaded but the filters left none. Different from the empty list
          above: here what needs changing are the filters. */}
      {loadState === 'ready' && tickets.length > 0 && filteredTickets.length === 0 && (
        <p className="mt-2 max-w-prose text-body text-label-secondary">
          Ningún ticket coincide con los filtros.
        </p>
      )}

      {loadState === 'ready' && filteredTickets.length > 0 && (
        <EditableTicketList
          sections={sections}
          sprints={sprints}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        epics={epics}
        sprints={sprints}
      />
    </section>
  )
}
