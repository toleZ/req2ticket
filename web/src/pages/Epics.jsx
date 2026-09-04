import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CreateEpicModal } from '@/components/epics/CreateEpicModal/CreateEpicModal'
import { EpicDetailModal } from '@/components/epics/EpicDetailModal/EpicDetailModal'
import { EpicList } from '@/components/epics/EpicList/EpicList'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { createEpic, deleteEpic, updateEpic } from '@/lib/api'

export function Epics() {
  const {
    tickets,
    setTickets,
    epics,
    setEpics,
    sprints,
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
  const [detailEpicId, setDetailEpicId] = useState(null)
  const [detailTicketId, setDetailTicketId] = useState(null)

  // Appends what the POST returns, which already carries the id and code the backend assigned.
  async function handleCreate(values) {
    const created = await createEpic(values)
    setEpics((prev) => [...prev, created])
  }

  async function handleUpdateEpic(epic, patch) {
    await updateEpic(epic, patch)
    setEpics((prev) => prev.map((current) => (current.id === epic.id ? { ...current, ...patch } : current)))
  }

  // The backend cascade-deletes the epic's tickets, so they are removed here too:
  // otherwise they would still be counted against an epic that no longer exists.
  async function handleDeleteEpic(epic) {
    await deleteEpic(epic.id)
    setEpics((prev) => prev.filter((current) => current.id !== epic.id))
    setTickets((prev) => prev.filter((ticket) => ticket.epicId !== epic.id))
  }

  const detailEpic = epics.find((epic) => epic.id === detailEpicId) ?? null
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId) ?? null

  return (
    <section>
      <PageHeader title="Épicas">
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Nueva épica
        </Button>
      </PageHeader>

      <LoadState
        state={loadState}
        isEmpty={epics.length === 0}
        loadingText="Cargando épicas…"
        errorText="No se pudieron cargar las épicas."
        emptyText="Todavía no hay épicas cargadas."
        onRetry={reload}
      />

      {loadState === 'ready' && epics.length > 0 && (
        <EpicList
          epics={epics}
          tickets={tickets}
          onSelectEpic={(epic) => setDetailEpicId(epic.id)}
          onSelectTicket={(ticket) => setDetailTicketId(ticket.id)}
        />
      )}

      <CreateEpicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />

      {/* Both modals mount only while something is chosen: that way every opening seeds its
          form from scratch. They cannot both be up at once — a ticket is not opened from an
          epic's record, precisely so two modal sheets never stack. */}
      {detailEpic && (
        <EpicDetailModal
          key={detailEpic.id}
          epic={detailEpic}
          tickets={tickets.filter((ticket) => ticket.epicId === detailEpic.id)}
          users={users}
          onClose={() => setDetailEpicId(null)}
          onUpdateEpic={handleUpdateEpic}
          onDeleteEpic={handleDeleteEpic}
        />
      )}

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
