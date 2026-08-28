import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CreateEpicModal } from '@/components/epics/CreateEpicModal'
import { EpicDetailModal } from '@/components/epics/EpicDetailModal'
import { EpicList } from '@/components/epics/EpicList'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal'
import { LoadState } from '@/components/ui/LoadState'
import {
  createEpic,
  deleteEpic,
  deleteTicket,
  getEpics,
  getSprints,
  getTickets,
  getUsers,
  updateEpic,
  updateTicket,
} from '@/lib/api'

const PRIMARY_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-3 py-1.5 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

export function Epics() {
  const [epics, setEpics] = useState([])
  // The tickets are fetched once and each row receives its own already filtered, instead
  // of every row asking /api/epics/{id}/tickets for itself.
  const [tickets, setTickets] = useState([])
  /* Los sprints y los usuarios no se dibujan en esta página: son para los desplegables del
     modal de detalle de un ticket, que desde acá también se puede abrir. */
  const [sprints, setSprints] = useState([])
  const [users, setUsers] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  /* Qué ficha está abierta, guardada por id y no como objeto: la entidad se busca en su lista
     en cada render, así que después de guardar el modal ve lo que devolvió la API, y si se
     borró pasa a null y el modal se desmonta solo. */
  const [detailEpicId, setDetailEpicId] = useState(null)
  const [detailTicketId, setDetailTicketId] = useState(null)

  /* `reloadKey` is the "retry": bumping it by one makes React run the effect below again.
     It is how you repeat a load without pulling the fetch out of the effect.

     The effect does not set loadState to 'loading': the initial state already is, and doing
     it here would trigger one extra render. `handleRetry` does, because there it is the
     response to a click. */
  useEffect(() => {
    Promise.all([getEpics(), getTickets(), getSprints(), getUsers()])
      .then(([nextEpics, nextTickets, nextSprints, nextUsers]) => {
        setEpics(nextEpics)
        setTickets(nextTickets)
        setSprints(nextSprints)
        setUsers(nextUsers)
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

  /* updateTicket devuelve el ticket recién leído de la API, así que se reemplaza entero: la
     respuesta ya trae epicName, sprintName, assigneeName y updatedAt recalculados. Es la misma
     función, palabra por palabra, en las tres páginas que abren el modal de un ticket. */
  async function handleUpdateTicket(ticket, patch) {
    const updated = await updateTicket(ticket, patch)
    setTickets((prev) => prev.map((current) => (current.id === updated.id ? updated : current)))
  }

  async function handleDeleteTicket(ticket) {
    await deleteTicket(ticket.id)
    setTickets((prev) => prev.filter((current) => current.id !== ticket.id))
  }

  const detailEpic = epics.find((epic) => epic.id === detailEpicId) ?? null
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId) ?? null

  return (
    <section>
      <PageHeader title="Épicas">
        <button type="button" onClick={() => setIsModalOpen(true)} className={PRIMARY_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
          Nueva épica
        </button>
      </PageHeader>

      <LoadState
        state={loadState}
        isEmpty={epics.length === 0}
        loadingText="Cargando épicas…"
        errorText="No se pudieron cargar las épicas."
        emptyText="Todavía no hay épicas cargadas."
        onRetry={handleRetry}
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

      {/* Los dos modales se montan sólo mientras hay algo elegido: así cada apertura siembra
          su formulario de cero. No pueden estar los dos a la vez — desde la ficha de una épica
          no se abre un ticket, justamente para no encimar dos hojas modales. */}
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
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
      )}
    </section>
  )
}
