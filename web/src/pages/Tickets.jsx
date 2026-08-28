import { useEffect, useState } from 'react'
import { ArrowUpDown, Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal'
import { TicketFilterBar } from '@/components/tickets/TicketFilterBar'
import { TicketList } from '@/components/tickets/TicketList'
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

const PRIMARY_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-3 py-1.5 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

const NEUTRAL_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-fill-tertiary px-3 py-1.5 text-subheadline font-medium text-label transition-colors
  duration-fast ease-out-quad hover:bg-fill-secondary disabled:opacity-50`

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

  /* El ticket abierto en el modal de detalle, guardado por id y no como objeto: el ticket de
     verdad se busca en `tickets` en cada render, así que después de guardar el modal ve lo
     que devolvió la API — el `updatedAt` nuevo incluido — sin que haya que refrescarlo a mano. */
  const [detailTicketId, setDetailTicketId] = useState(null)

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

  /* updateTicket devuelve el ticket recién leído de la API, así que acá se reemplaza entero
     en vez de recomponerlo a mano. Antes había que recalcular `sprintName` en esta función; con
     el modal de detalle también podrían cambiar `epicName` y `assigneeName`, y `updatedAt` no
     hay forma de adivinarlo desde el navegador. */
  async function handleUpdateTicket(ticket, patch) {
    const updated = await updateTicket(ticket, patch)
    setTickets((prev) => prev.map((current) => (current.id === updated.id ? updated : current)))
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

  /* Se busca acá y no se guarda en el estado: si el ticket se borró, esto pasa a null y el
     modal se desmonta solo, sin un handler que se acuerde de cerrarlo. */
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId) ?? null

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
          className={NEUTRAL_BUTTON}
        >
          <ArrowUpDown className="size-4" aria-hidden="true" />
          Prioridad
        </button>
        <button type="button" onClick={() => setIsModalOpen(true)} className={PRIMARY_BUTTON}>
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
        <TicketList sections={sections} onSelectTicket={(ticket) => setDetailTicketId(ticket.id)} />
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        epics={epics}
        sprints={sprints}
      />

      {/* Montado sólo mientras hay un ticket elegido: así cada apertura siembra el formulario
          de cero y no queda estado del anterior. El `key` es la misma idea escrita dos veces,
          y está a propósito — el día que se pueda saltar de un ticket a otro sin cerrar, es lo
          único que evita que el segundo aparezca con el texto del primero. */}
      {detailTicket && (
        <TicketDetailModal
          key={detailTicket.id}
          ticket={detailTicket}
          epics={epics}
          sprints={sprints}
          users={users}
          onClose={() => setDetailTicketId(null)}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
      )}
    </section>
  )
}
