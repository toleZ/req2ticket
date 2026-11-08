import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { toast } from '@/components/ui/Toast/toast'
import { useCurrentProject } from '@/hooks/useCurrentProject'
import { readSession } from '@/lib/auth'
import { LIST_KEYS, SORT_OPTIONS, applyFilters } from '@/lib/epicFilters'
import { projectPath } from '@/lib/navItems'
import { TICKET_STATUS_OPTIONS, isOpenStatus } from '@/lib/options'
import { PERMISSIONS } from '@/lib/permissions'
import { useCreateEpic, useEpics } from '@/lib/queries/epics'
import { loadStateOf, retryAll } from '@/lib/queries/loadState'
import { useMembers } from '@/lib/queries/members'
import { useTickets } from '@/lib/queries/tickets'
import { changeParams, countActive, readFilters, setListParam } from '@/lib/urlFilters'

/* The open statuses, for the "Ver tickets abiertos" link: the Backlog filtered to them. */
const OPEN_STATUSES = TICKET_STATUS_OPTIONS.map((option) => option.value).filter(isOpenStatus).join(',')

export function Epics() {
  const { projectId, projectKey, can } = useCurrentProject()
  const epicsQuery = useEpics(projectId)
  const ticketsQuery = useTickets(projectId)
  const membersQuery = useMembers(projectId)
  const createEpic = useCreateEpic(projectId)

  const epics = epicsQuery.data ?? []
  const tickets = ticketsQuery.data ?? []
  const members = membersQuery.data ?? []
  const loadState = loadStateOf(epicsQuery, ticketsQuery, membersQuery)
  const canManage = can(PERMISSIONS.EPICS_MANAGE)
  const backlogPath = projectPath(projectKey, 'backlog')

  const [isModalOpen, setIsModalOpen] = useState(false)

  /* Which record is open, held by id: the sheet reads it from the cache on every render, so after
     saving it shows what the API returned, and once deleted it closes on its own. */
  const [detailEpicId, setDetailEpicId] = useState(null)
  const [detailTicketId, setDetailTicketId] = useState(null)

  /* Filters in the URL, like the Backlog's (see lib/epicFilters.js and lib/urlFilters.js). */
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params, LIST_KEYS, SORT_OPTIONS)
  const activeCount = countActive(filters, LIST_KEYS)
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

  // The modal awaits this: it closes only once the API created the epic.
  async function handleCreate(values) {
    const created = await createEpic.mutateAsync(values)
    toast.success(`Épica ${created.code} creada`)
  }

  const detailEpicExists = epics.some((epic) => epic.id === detailEpicId)

  const meta = loadState === 'ready' ? `${countText} · ${activeEpics} ${activeEpics === 1 ? 'activa' : 'activas'}` : null

  return (
    <section>
      <PageHeader title="Épicas" meta={meta}>
        <SearchBox value={search} placeholder="Buscar por nombre o código" onChange={handleSearchChange} />
        {canManage && (
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="shrink-0">
            <Plus className="size-4" aria-hidden="true" />
            Crear épica
          </Button>
        )}
      </PageHeader>

      {loadState === 'ready' && (
        <EpicFilterBar
          filters={filters}
          activeCount={activeCount}
          members={members}
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
        emptyText={
          canManage
            ? 'Todavía no hay épicas. Creá la primera para empezar a cargar tickets.'
            : 'Todavía no hay épicas cargadas.'
        }
        onRetry={() => retryAll(epicsQuery, ticketsQuery, membersQuery)}
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
          members={members}
          backlogPath={backlogPath}
          onSelectEpic={(epic) => setDetailEpicId(epic.id)}
          onSelectTicket={(ticket) => setDetailTicketId(ticket.id)}
        />
      )}

      {canManage && (
        <CreateEpicModal
          isOpen={isModalOpen}
          members={members}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Both sheets mount only while something is chosen, so every opening starts clean. They
          cannot both be up at once — a ticket is not opened from an epic's sheet, so two modal
          sheets never stack. */}
      <AnimatePresence>
        {detailEpicExists && (
          <EpicDetailModal
            key={detailEpicId}
            projectId={projectId}
            epicId={detailEpicId}
            tickets={tickets.filter((ticket) => ticket.epicId === detailEpicId)}
            members={members}
            canManage={canManage}
            openTicketsHref={`${backlogPath}?epic=${detailEpicId}&status=${OPEN_STATUSES}`}
            onClose={() => setDetailEpicId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailTicketId && (
          <TicketDetailModal
            key={detailTicketId}
            projectId={projectId}
            ticketId={detailTicketId}
            canWrite={can(PERMISSIONS.TICKETS_WRITE)}
            canDelete={can(PERMISSIONS.TICKETS_DELETE)}
            onClose={() => setDetailTicketId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
