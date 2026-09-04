import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowUpDown, Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal/CreateTicketModal'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { TicketFilterBar } from '@/components/tickets/TicketFilterBar/TicketFilterBar'
import { TicketList } from '@/components/tickets/TicketList/TicketList'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { createTicket } from '@/lib/api'
import { NO_SPRINT, TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from '@/lib/ticketOptions'

/* The order comes from TICKET_PRIORITY_OPTIONS, which runs low to high, so the sort
   subtracts the other way round. Deriving it instead of hand-writing a map keeps a newly
   added priority from breaking the ordering silently. */
function priorityRank(priority) {
  return TICKET_PRIORITY_OPTIONS.findIndex((option) => option.value === priority)
}

export function Tickets() {
  const {
    tickets,
    setTickets,
    epics,
    sprints,
    users,
    loadState,
    reload,
    updateTicketAndStore,
    deleteTicketAndStore,
  } = useOutletContext()

  const [isModalOpen, setIsModalOpen] = useState(false)

  /* The ticket open in the detail modal, held by id and not as an object: the real ticket is
     looked up in `tickets` on every render, so after saving the modal sees what the API
     returned — the new `updatedAt` included — without anyone refreshing it by hand. */
  const [detailTicketId, setDetailTicketId] = useState(null)

  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [epicFilter, setEpicFilter] = useState('')
  const [sprintFilter, setSprintFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortByPriority, setSortByPriority] = useState(false)

  // Appends what the POST returns, which already carries the id and code the backend assigned.
  async function handleCreate(values) {
    const created = await createTicket(values)
    setTickets((prev) => [...prev, created])
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

  const sections = TICKET_STATUS_OPTIONS.map((status) => {
    const sectionTickets = filteredTickets.filter((ticket) => ticket.status === status.value)
    if (sortByPriority) {
      sectionTickets.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    }
    return { status, tickets: sectionTickets }
  })

  /* Looked up here rather than held in state: if the ticket was deleted this becomes null and
     the modal unmounts on its own, with no handler having to remember to close it. */
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId) ?? null

  const subtitle =
    loadState === 'ready'
      ? `${filteredTickets.length} de ${tickets.length} tickets del proyecto.`
      : null

  return (
    <section>
      <PageHeader title="Tickets" subtitle={subtitle}>
        <Button
          variant="neutral"
          size="sm"
          onClick={() => setSortByPriority(!sortByPriority)}
          ariaPressed={sortByPriority}
        >
          <ArrowUpDown className="size-4" aria-hidden="true" />
          Prioridad
        </Button>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo ticket
        </Button>
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
        onRetry={reload}
      />

      {/* There are tickets loaded but the filters left none. Different from the empty list
          above: here what needs changing are the filters. */}
      {loadState === 'ready' && tickets.length > 0 && filteredTickets.length === 0 && (
        <p className="mt-2 max-w-prose text-body text-label-secondary">
          Ningún ticket coincide con los filtros.
        </p>
      )}

      {loadState === 'ready' && filteredTickets.length > 0 && (
        <TicketList sections={sections} onSelectTicket={(ticket) => setDetailTicketId(ticket.id)} />
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        epics={epics}
        sprints={sprints}
      />

      {/* Mounted only while a ticket is chosen: that way every opening seeds the form from
          scratch and no state from the previous one is left. The `key` is the same idea
          written twice, and it is deliberate — the day you can jump from one ticket to another
          without closing, it is the only thing stopping the second appearing with the first's
          text. */}
      {detailTicket && (
        <TicketDetailModal
          key={detailTicket.id}
          ticket={detailTicket}
          epics={epics}
          sprints={sprints}
          users={users}
          onClose={() => setDetailTicketId(null)}
          onUpdateTicket={updateTicketAndStore}
          onDeleteTicket={deleteTicketAndStore}
        />
      )}
    </section>
  )
}
