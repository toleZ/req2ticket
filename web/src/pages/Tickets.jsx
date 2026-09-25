import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal/CreateTicketModal'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { TicketFilterBar } from '@/components/tickets/TicketFilterBar/TicketFilterBar'
import { TicketList } from '@/components/tickets/TicketList/TicketList'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { SearchBox } from '@/components/ui/SearchBox/SearchBox'
import { createTicket } from '@/lib/api'
import { readSession } from '@/lib/auth'
import { LIST_KEYS, applyFilters, byPriority, countActive, readFilters } from '@/lib/backlogFilters'
import { TICKET_STATUS_OPTIONS } from '@/lib/ticketOptions'
import { changeParams, setListParam } from '@/lib/urlFilters'

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

  /* The filters are the URL (see lib/backlogFilters.js). Each change is a history entry, so
     Back undoes it — except typing in the search, which replaces the entry instead of adding
     one per key. */
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const activeCount = countActive(filters)

  function updateParams(change, replace = false) {
    changeParams(setParams, change, replace)
  }

  /* The search box's text lives here (see SearchBox) and is written to the URL as you type. */
  const [search, setSearch] = useState(filters.q)

  function handleSearchChange(text) {
    setSearch(text)
    updateParams((next) => (text ? next.set('q', text) : next.delete('q')), true)
  }

  function setList(key, values) {
    updateParams((next) => setListParam(next, key, values))
  }

  function clearFilters() {
    setSearch('')
    updateParams((next) => ['q', 'mine', ...LIST_KEYS].forEach((key) => next.delete(key)))
  }

  // Appends what the POST returns, which already carries the id and code the backend assigned.
  async function handleCreate(values) {
    const created = await createTicket(values)
    setTickets((prev) => [...prev, created])
  }

  const filteredTickets = applyFilters(tickets, filters, readSession()?.user?.id)
  const points = filteredTickets.reduce((sum, ticket) => sum + ticket.points, 0)

  const visibleStatuses = filters.status.length
    ? TICKET_STATUS_OPTIONS.filter((status) => filters.status.includes(status.value))
    : TICKET_STATUS_OPTIONS

  const sections = visibleStatuses.map((status) => {
    const sectionTickets = filteredTickets.filter((ticket) => ticket.status === status.value)
    if (filters.sort === 'priority') sectionTickets.sort(byPriority)
    return { status, tickets: sectionTickets }
  })

  /* Looked up here rather than held in state: if the ticket was deleted this becomes null and
     the modal unmounts on its own, with no handler having to remember to close it. */
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId) ?? null

  const countText =
    filteredTickets.length === tickets.length
      ? `${tickets.length} ${tickets.length === 1 ? 'ticket' : 'tickets'}`
      : `${filteredTickets.length} de ${tickets.length} tickets`

  const meta = loadState === 'ready' ? `${countText} · ${points.toLocaleString('es-AR')} pts` : null

  return (
    <section>
      <PageHeader title="Backlog" meta={meta}>
        <SearchBox value={search} placeholder="Buscar por texto o código" onChange={handleSearchChange} />
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus className="size-4" aria-hidden="true" />
          Crear ticket
        </Button>
      </PageHeader>

      {loadState === 'ready' && (
        <TicketFilterBar
          filters={filters}
          activeCount={activeCount}
          epics={epics}
          sprints={sprints}
          users={users}
          onListChange={setList}
          onMineChange={(on) => updateParams((next) => (on ? next.set('mine', '1') : next.delete('mine')))}
          onSortChange={(sort) =>
            updateParams((next) => (sort === 'priority' ? next.set('sort', 'priority') : next.delete('sort')))
          }
          onClear={clearFilters}
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
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-body text-label-secondary">Ningún ticket coincide con los filtros.</p>
          {activeCount > 0 && (
            <Button variant="neutral" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {loadState === 'ready' && filteredTickets.length > 0 && (
        <TicketList
          key={params.toString()}
          sections={sections}
          epics={epics}
          onSelectTicket={(ticket) => setDetailTicketId(ticket.id)}
        />
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
