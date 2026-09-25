import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'

import { CreateEpicModal } from '@/components/epics/CreateEpicModal/CreateEpicModal'
import { EpicDetailModal } from '@/components/epics/EpicDetailModal/EpicDetailModal'
import { EpicFilterBar } from '@/components/epics/EpicFilterBar/EpicFilterBar'
import { EpicList } from '@/components/epics/EpicList/EpicList'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { SearchBox } from '@/components/ui/SearchBox/SearchBox'
import { createEpic, deleteEpic, updateEpic } from '@/lib/api'
import { readSession } from '@/lib/auth'
import { LIST_KEYS, applyFilters, countActive, readFilters } from '@/lib/epicFilters'
import { changeParams, setListParam } from '@/lib/urlFilters'

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

  /* Filters in the URL, like the Backlog's (see lib/epicFilters.js and lib/urlFilters.js). */
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const activeCount = countActive(filters)
  const [search, setSearch] = useState(filters.q)

  function updateParams(change, replace = false) {
    changeParams(setParams, change, replace)
  }

  function handleSearchChange(text) {
    setSearch(text)
    updateParams((next) => (text ? next.set('q', text) : next.delete('q')), true)
  }

  function clearFilters() {
    setSearch('')
    updateParams((next) => ['q', 'mine', ...LIST_KEYS].forEach((key) => next.delete(key)))
  }

  const visibleEpics = applyFilters(epics, filters, readSession()?.user?.id)
  const activeEpics = visibleEpics.filter((epic) => epic.status === 'active').length
  const countText =
    visibleEpics.length === epics.length
      ? `${epics.length} ${epics.length === 1 ? 'épica' : 'épicas'}`
      : `${visibleEpics.length} de ${epics.length} épicas`

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

  const meta = loadState === 'ready' ? `${countText} · ${activeEpics} ${activeEpics === 1 ? 'activa' : 'activas'}` : null

  return (
    <section>
      <PageHeader title="Épicas" meta={meta}>
        <SearchBox value={search} placeholder="Buscar por nombre o código" onChange={handleSearchChange} />
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus className="size-4" aria-hidden="true" />
          Crear épica
        </Button>
      </PageHeader>

      {loadState === 'ready' && (
        <EpicFilterBar
          filters={filters}
          activeCount={activeCount}
          users={users}
          onListChange={(key, values) => updateParams((next) => setListParam(next, key, values))}
          onMineChange={(on) => updateParams((next) => (on ? next.set('mine', '1') : next.delete('mine')))}
          onSortChange={(sort) => updateParams((next) => (sort === 'status' ? next.delete('sort') : next.set('sort', sort)))}
          onClear={clearFilters}
        />
      )}

      <LoadState
        state={loadState}
        isEmpty={epics.length === 0}
        loadingText="Cargando épicas…"
        errorText="No se pudieron cargar las épicas."
        emptyText="Todavía no hay épicas cargadas."
        onRetry={reload}
      />

      {loadState === 'ready' && epics.length > 0 && visibleEpics.length === 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-body text-label-secondary">Ninguna épica coincide con los filtros.</p>
          {activeCount > 0 && (
            <Button variant="neutral" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {loadState === 'ready' && visibleEpics.length > 0 && (
        <EpicList
          epics={visibleEpics}
          tickets={tickets}
          onSelectEpic={(epic) => setDetailEpicId(epic.id)}
          onSelectTicket={(ticket) => setDetailTicketId(ticket.id)}
        />
      )}

      <CreateEpicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />

      {/* Both modals mount only while something is chosen: that way every opening seeds its
          form from scratch. They cannot both be up at once — a ticket is not opened from an
          epic's record, precisely so two modal sheets never stack. */}
      <AnimatePresence>
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
