import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CreateSprintModal } from '@/components/sprints/CreateSprintModal/CreateSprintModal'
import { SprintBacklog } from '@/components/sprints/SprintBacklog/SprintBacklog'
import { SprintList } from '@/components/sprints/SprintList/SprintList'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { createSprint, deleteSprint, updateSprint } from '@/lib/api'
import { SPRINT_ACTIVE } from '@/lib/sprintOptions'

export function Sprints() {
  const {
    tickets,
    setTickets,
    epics,
    sprints,
    setSprints,
    users,
    loadState,
    reload,
    updateTicketAndStore,
    deleteTicketAndStore,
  } = useOutletContext()

  const [isModalOpen, setIsModalOpen] = useState(false)

  /* Held by id and not as an object: the ticket is looked up in `tickets` on every render, so
     after saving the modal sees what the API returned, and if it was deleted this becomes null
     and the modal unmounts on its own. */
  const [detailTicketId, setDetailTicketId] = useState(null)

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
        onRetry={reload}
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
          onUpdateTicket={updateTicketAndStore}
          onDeleteTicket={deleteTicketAndStore}
        />
      )}
    </section>
  )
}
