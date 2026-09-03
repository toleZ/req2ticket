import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CreateSprintModal } from '@/components/sprints/CreateSprintModal/CreateSprintModal'
import { SprintBacklog } from '@/components/sprints/SprintBacklog/SprintBacklog'
import { SprintList } from '@/components/sprints/SprintList/SprintList'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
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

export function Sprints() {
  const [sprints, setSprints] = useState([])
  const [tickets, setTickets] = useState([])
  /* The epics and the users are not drawn on this page: they are for the dropdowns of a
     ticket's detail modal, which opens from a sprint's card and from the Backlog block. */
  const [epics, setEpics] = useState([])
  const [users, setUsers] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  /* Held by id and not as an object: the ticket is looked up in `tickets` on every render, so
     after saving the modal sees what the API returned, and if it was deleted this becomes null
     and the modal unmounts on its own. */
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

  /* updateTicket returns the ticket freshly read from the API, so it is replaced whole. It is
     the same function, word for word, in the three pages that open a ticket's modal. */
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
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo sprint
        </Button>
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

      {/* Mounted only while a ticket is chosen: that way every opening seeds the form from
          scratch and no state from the previous one is left. */}
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
