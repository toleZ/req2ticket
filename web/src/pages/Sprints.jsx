import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CreateSprintModal } from '@/components/sprints/CreateSprintModal/CreateSprintModal'
import { SprintDetailModal } from '@/components/sprints/SprintDetailModal/SprintDetailModal'
import { SprintBacklog } from '@/components/sprints/SprintBacklog/SprintBacklog'
import { SprintList } from '@/components/sprints/SprintList/SprintList'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { createSprint, deleteSprint, updateSprint } from '@/lib/api'
import { SPRINT_ACTIVE } from '@/lib/options'

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

  /* Which record is open, held by id and not as an object: the entity is looked up in its list
     on every render, so after saving the modal sees what the API returned, and if it was
     deleted this becomes null and the modal unmounts on its own. */
  const [detailSprintId, setDetailSprintId] = useState(null)
  const [detailTicketId, setDetailTicketId] = useState(null)

  // Appends what the POST returns, which already carries the id the backend assigned.
  async function handleCreate(values) {
    const created = await createSprint(values)
    setSprints((prev) => [...prev, created])
  }

  async function handleUpdateSprint(sprint, patch) {
    await updateSprint(sprint, patch)
    setSprints((prev) => prev.map((current) => (current.id === sprint.id ? { ...current, ...patch } : current)))
    // Tickets carry their sprint's name, so a rename has to reach them too.
    if (patch.name && patch.name !== sprint.name) {
      setTickets((prev) =>
        prev.map((ticket) => (ticket.sprintId === sprint.id ? { ...ticket, sprintName: patch.name } : ticket)),
      )
    }
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
  const detailSprint = sprints.find((sprint) => sprint.id === detailSprintId) ?? null
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId) ?? null

  const countText = sprints.length === 1 ? '1 sprint' : `${sprints.length} sprints`
  const activeText = activeSprint ? ` · ${activeSprint.name} en curso` : ''
  const meta = loadState === 'ready' ? `${countText}${activeText}` : null

  function handleSelectTicket(ticket) {
    setDetailTicketId(ticket.id)
  }

  return (
    <section>
      <PageHeader title="Sprints" meta={meta}>
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus className="size-4" aria-hidden="true" />
          Crear sprint
        </Button>
      </PageHeader>

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
          activeSprint={activeSprint}
          onSelectSprint={(sprint) => setDetailSprintId(sprint.id)}
          onUpdateSprint={handleUpdateSprint}
          onDeleteSprint={handleDeleteSprint}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {loadState === 'ready' && (
        <SprintBacklog tickets={backlogTickets} onSelectTicket={handleSelectTicket} />
      )}

      <CreateSprintModal
        isOpen={isModalOpen}
        activeSprint={activeSprint}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />

      {/* Mounted only while a record is chosen: that way every opening seeds the form from
          scratch and no state from the previous one is left. */}
      <AnimatePresence>
        {detailSprint && (
          <SprintDetailModal
            key={detailSprint.id}
            sprint={detailSprint}
            tickets={tickets.filter((ticket) => ticket.sprintId === detailSprint.id)}
            activeSprint={activeSprint}
            onClose={() => setDetailSprintId(null)}
            onUpdateSprint={handleUpdateSprint}
            onDeleteSprint={handleDeleteSprint}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
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
      </AnimatePresence>
    </section>
  )
}
