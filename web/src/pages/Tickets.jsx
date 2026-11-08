import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { useCurrentProject } from '@/hooks/useCurrentProject'
import { readSession } from '@/lib/auth'
import { LIST_KEYS, SORT_OPTIONS, applyFilters, byPriority, withTicketNames } from '@/lib/backlogFilters'
import { TICKET_STATUS_OPTIONS } from '@/lib/options'
import { PERMISSIONS } from '@/lib/permissions'
import { useEpics } from '@/lib/queries/epics'
import { loadStateOf, retryAll } from '@/lib/queries/loadState'
import { useMembers } from '@/lib/queries/members'
import { useSprints } from '@/lib/queries/sprints'
import { useTickets } from '@/lib/queries/tickets'
import { changeParams, countActive, readFilters, setListParam } from '@/lib/urlFilters'

/* The Backlog: every ticket of the project, grouped by status, with the filters in the URL.
   It reads the same four lists as the rest of the project (the cache shares them), and the
   ticket sheets fetch their own detail. */
export function Tickets() {
  const { projectId, can } = useCurrentProject()
  const ticketsQuery = useTickets(projectId)
  const epicsQuery = useEpics(projectId)
  const sprintsQuery = useSprints(projectId)
  const membersQuery = useMembers(projectId)
  const loadState = loadStateOf(ticketsQuery, epicsQuery, sprintsQuery, membersQuery)

  const epics = epicsQuery.data ?? []
  const sprints = sprintsQuery.data ?? []
  const members = membersQuery.data ?? []
  const tickets = withTicketNames(ticketsQuery.data ?? [], { epics, sprints, members })

  const canWrite = can(PERMISSIONS.TICKETS_WRITE)
  const canDelete = can(PERMISSIONS.TICKETS_DELETE)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  /* What the create sheet starts with, and a counter that remounts it so it reads them: a
     shortcut from a story ("Agregar tarea") presets the type, the parent, the epic and the sprint. */
  const [createDefaults, setCreateDefaults] = useState(null)
  const [createKey, setCreateKey] = useState(0)

  /* The ticket open in its sheet, by id: the sheet fetches the rest itself. */
  const [detailTicketId, setDetailTicketId] = useState(null)

  /* The filters are the URL (see lib/backlogFilters.js). Each change is a history entry, so
     Back undoes it — except typing in the search, which replaces the entry instead of adding
     one per key. */
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params, LIST_KEYS, SORT_OPTIONS)
  const activeCount = countActive(filters, LIST_KEYS)

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

  function openCreate(defaults = null) {
    setCreateDefaults(defaults)
    setCreateKey(createKey + 1)
    setIsCreateOpen(true)
  }

  /* From a ticket's sheet: close it and open the create sheet with what it already knows. */
  function handleCreateChild(defaults) {
    setDetailTicketId(null)
    openCreate(defaults)
  }

  const filteredTickets = applyFilters(tickets, filters, readSession()?.user?.id)
  const points = filteredTickets.reduce((sum, ticket) => sum + (ticket.points ?? 0), 0)

  const visibleStatuses = filters.status.length
    ? TICKET_STATUS_OPTIONS.filter((status) => filters.status.includes(status.value))
    : TICKET_STATUS_OPTIONS

  const sections = visibleStatuses.map((status) => {
    const sectionTickets = filteredTickets.filter((ticket) => ticket.status === status.value)
    if (filters.sort === 'priority') sectionTickets.sort(byPriority)
    return { status, tickets: sectionTickets }
  })

  const countText =
    filteredTickets.length === tickets.length
      ? `${tickets.length} ${tickets.length === 1 ? 'ticket' : 'tickets'}`
      : `${filteredTickets.length} de ${tickets.length} tickets`

  const meta = loadState === 'ready' ? `${countText} · ${points.toLocaleString('es-AR')} pts` : null

  return (
    <section>
      <PageHeader title="Backlog" meta={meta}>
        <SearchBox value={search} placeholder="Buscar por texto o código" onChange={handleSearchChange} />
        {canWrite && (
          <Button size="sm" onClick={() => openCreate()} className="shrink-0">
            <Plus className="size-4" aria-hidden="true" />
            Crear ticket
          </Button>
        )}
      </PageHeader>

      {loadState === 'ready' && (
        <TicketFilterBar
          filters={filters}
          activeCount={activeCount}
          epics={epics}
          sprints={sprints}
          users={members}
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
        emptyText={canWrite ? 'Todavía no hay tickets. Creá el primero.' : 'Todavía no hay tickets cargados.'}
        onRetry={() => retryAll(ticketsQuery, epicsQuery, sprintsQuery, membersQuery)}
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

      {canWrite && (
        <CreateTicketModal
          key={createKey}
          projectId={projectId}
          isOpen={isCreateOpen}
          defaults={createDefaults ?? undefined}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* Mounted only while a ticket is chosen, so every opening starts from scratch. */}
      <AnimatePresence>
        {detailTicketId && (
          <TicketDetailModal
            key={detailTicketId}
            projectId={projectId}
            ticketId={detailTicketId}
            canWrite={canWrite}
            canDelete={canDelete}
            onClose={() => setDetailTicketId(null)}
            onCreateChild={handleCreateChild}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
