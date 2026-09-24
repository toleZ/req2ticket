import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Plus, Search } from 'lucide-react'

import { CreateTicketModal } from '@/components/tickets/CreateTicketModal/CreateTicketModal'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { TicketFilterBar } from '@/components/tickets/TicketFilterBar/TicketFilterBar'
import { TicketList } from '@/components/tickets/TicketList/TicketList'
import { Button } from '@/components/ui/Button/Button'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { createTicket } from '@/lib/api'
import { readSession } from '@/lib/auth'
import { LIST_KEYS, applyFilters, byPriority, countActive, readFilters } from '@/lib/backlogFilters'
import { TICKET_STATUS_OPTIONS } from '@/lib/ticketOptions'

const SEARCH_BOX = `flex min-h-11 w-full items-center gap-2 rounded-control bg-fill-tertiary px-2.5
  transition-colors duration-fast hover:bg-fill-secondary focus-ring-within sm:w-72 lg:min-h-8`

const KBD = `hidden h-5 min-w-5 place-items-center rounded-[5px] bg-fill-secondary px-1 text-caption2
  font-medium text-label-secondary sm:grid`

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
  const searchRef = useRef(null)

  /* The function form starts from the URL as it is now, not as it was on the last render:
     two quick changes (a chip, then another) would otherwise overwrite each other. */
  function updateParams(change, replace = false) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        change(next)
        return next
      },
      { replace },
    )
  }

  /* The search box keeps its own text and writes it to the URL as you type. Bound to the URL
     alone, a fast typist lost letters: the box showed the URL, which lags a keystroke. */
  const [search, setSearch] = useState(filters.q)

  function handleSearchChange(text) {
    setSearch(text)
    updateParams((next) => (text ? next.set('q', text) : next.delete('q')), true)
  }

  function setList(key, values) {
    updateParams((next) => (values.length ? next.set(key, values.join(',')) : next.delete(key)))
  }

  function clearFilters() {
    setSearch('')
    updateParams((next) => ['q', 'mine', ...LIST_KEYS].forEach((key) => next.delete(key)))
  }

  /* "/" jumps to the search from anywhere on the page, unless you are already typing. */
  useEffect(() => {
    function handleSlash(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', handleSlash)
    return () => window.removeEventListener('keydown', handleSlash)
  }, [])

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

  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="text-title1 text-label">Backlog</h1>
          {loadState === 'ready' && (
            <p className="mono text-caption text-label-secondary tabular-nums">
              {countText} · {points.toLocaleString('es-AR')} pts
            </p>
          )}
        </div>

        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          <label className={SEARCH_BOX}>
            <Search className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && search) {
                  e.preventDefault()
                  handleSearchChange('')
                }
              }}
              placeholder="Buscar por texto o código"
              aria-label="Buscar por texto o código"
              aria-keyshortcuts="/"
              className="min-w-0 flex-1 self-stretch bg-transparent text-footnote text-label placeholder:text-label-tertiary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {!search && (
              <kbd className={KBD} aria-hidden="true">
                /
              </kbd>
            )}
          </label>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="shrink-0">
            <Plus className="size-4" aria-hidden="true" />
            Crear ticket
          </Button>
        </div>
      </div>

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
