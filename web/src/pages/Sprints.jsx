import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CreateSprintModal } from '@/components/sprints/CreateSprintModal'
import { SprintBacklog } from '@/components/sprints/SprintBacklog'
import { SprintList } from '@/components/sprints/SprintList'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal'
import { LoadState } from '@/components/ui/LoadState'
import {
  createSprint,
  deleteSprint,
  deleteTicket,
  getEpics,
  getSprints,
  getTickets,
  getUsers,
  updateSprint,
  updateTicket,
} from '@/lib/api'
import { SPRINT_ACTIVE } from '@/lib/sprintOptions'

const PRIMARY_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-3 py-1.5 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

export function Sprints() {
  const [sprints, setSprints] = useState([])
  const [tickets, setTickets] = useState([])
  /* Las épicas y los usuarios no se dibujan en esta página: son para los desplegables del
     modal de detalle de un ticket, que se abre desde la tarjeta de un sprint y desde el
     bloque Backlog. */
  const [epics, setEpics] = useState([])
  const [users, setUsers] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  /* Guardado por id y no como objeto: el ticket se busca en `tickets` en cada render, así que
     después de guardar el modal ve lo que devolvió la API, y si se borró pasa a null y el
     modal se desmonta solo. */
  const [detailTicketId, setDetailTicketId] = useState(null)

  /* `reloadKey` is the "retry": bumping it by one makes React run the effect below again.
     It is how you repeat a load without pulling the fetch out of the effect.

     The effect does not set loadState to 'loading': the initial state already is, and doing
     it here would trigger one extra render. `handleRetry` does, because there it is the
     response to a click. */
  useEffect(() => {
    Promise.all([getSprints(), getTickets(), getEpics(), getUsers()])
      .then(([nextSprints, nextTickets, nextEpics, nextUsers]) => {
        setSprints(nextSprints)
        setTickets(nextTickets)
        setEpics(nextEpics)
        setUsers(nextUsers)
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

  // The backend leaves the deleted sprint's tickets without a sprint (SetNull), so the same
  // has to happen here: they go back to the backlog instead of disappearing.
  async function handleDeleteSprint(sprint) {
    await deleteSprint(sprint.id)
    setSprints((prev) => prev.filter((current) => current.id !== sprint.id))
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.sprintId === sprint.id ? { ...ticket, sprintId: null, sprintName: null } : ticket,
      ),
    )
  }

  /* updateTicket devuelve el ticket recién leído de la API, así que se reemplaza entero. Es la
     misma función, palabra por palabra, en las tres páginas que abren el modal de un ticket. */
  async function handleUpdateTicket(ticket, patch) {
    const updated = await updateTicket(ticket, patch)
    setTickets((prev) => prev.map((current) => (current.id === updated.id ? updated : current)))
  }

  async function handleDeleteTicket(ticket) {
    await deleteTicket(ticket.id)
    setTickets((prev) => prev.filter((current) => current.id !== ticket.id))
  }

  const activeSprint = sprints.find((sprint) => sprint.status === SPRINT_ACTIVE)
  const backlogTickets = tickets.filter((ticket) => ticket.sprintId === null)
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId) ?? null

  const activeText = activeSprint ? `${activeSprint.name} en curso · ` : ''
  const countText =
    sprints.length === 1 ? '1 sprint en total' : `${sprints.length} sprints en total`
  const subtitle = loadState === 'ready' ? `${activeText}${countText}.` : null

  function handleSelectTicket(ticket) {
    setDetailTicketId(ticket.id)
  }

  return (
    <section>
      <PageHeader title="Sprints" subtitle={subtitle}>
        <button type="button" onClick={() => setIsModalOpen(true)} className={PRIMARY_BUTTON}>
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
          tickets={tickets}
          onUpdateSprint={handleUpdateSprint}
          onDeleteSprint={handleDeleteSprint}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {loadState === 'ready' && (
        <SprintBacklog tickets={backlogTickets} onSelectTicket={handleSelectTicket} />
      )}

      <CreateSprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />

      {/* Montado sólo mientras hay un ticket elegido: así cada apertura siembra el formulario
          de cero y no queda estado del anterior. */}
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
