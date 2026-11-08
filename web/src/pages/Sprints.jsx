import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { CalendarRange, Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CompleteSprintModal } from '@/components/sprints/CompleteSprintModal/CompleteSprintModal'
import { CreateSprintModal } from '@/components/sprints/CreateSprintModal/CreateSprintModal'
import { SprintDetailModal } from '@/components/sprints/SprintDetailModal/SprintDetailModal'
import { SprintBacklog } from '@/components/sprints/SprintBacklog/SprintBacklog'
import { SprintList } from '@/components/sprints/SprintList/SprintList'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { Button } from '@/components/ui/Button/Button'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { toast } from '@/components/ui/Toast/toast'
import { useCurrentProject } from '@/hooks/useCurrentProject'
import { projectPath } from '@/lib/navItems'
import { SPRINT_ACTIVE, SPRINT_PLANNED } from '@/lib/options'
import { PERMISSIONS } from '@/lib/permissions'
import { loadStateOf, retryAll } from '@/lib/queries/loadState'
import {
  useCreateSprint,
  useDeleteSprint,
  useSprints,
  useStartSprint,
  useUpdateSprint,
} from '@/lib/queries/sprints'
import { useTickets } from '@/lib/queries/tickets'

export function Sprints() {
  const { projectId, projectKey, can } = useCurrentProject()
  const sprintsQuery = useSprints(projectId)
  const ticketsQuery = useTickets(projectId)
  const createSprint = useCreateSprint(projectId)
  const updateSprint = useUpdateSprint(projectId)
  const startSprint = useStartSprint(projectId)
  const deleteSprint = useDeleteSprint(projectId)

  const sprints = sprintsQuery.data ?? []
  const tickets = ticketsQuery.data ?? []
  const loadState = loadStateOf(sprintsQuery, ticketsQuery)
  const canManage = can(PERMISSIONS.SPRINTS_MANAGE)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completingSprintId, setCompletingSprintId] = useState(null)

  /* Which record is open, held by id: the sheet reads it from the list on every render, so after
     saving it shows what the API returned, and once deleted it closes on its own. */
  const [detailSprintId, setDetailSprintId] = useState(null)
  const [detailTicketId, setDetailTicketId] = useState(null)

  // Each handler returns the request's promise: the confirmations and sheets wait for it, and
  // stay open with the error if it fails.
  async function handleCreate(values) {
    const created = await createSprint.mutateAsync(values)
    toast.success(`${created.name} creado`)
  }

  function handleUpdateSprint(sprint, patch) {
    return updateSprint.mutateAsync({ sprint, patch })
  }

  function handleStartSprint(sprint) {
    return startSprint.mutateAsync(sprint.id)
  }

  function handleDeleteSprint(sprint) {
    return deleteSprint.mutateAsync(sprint.id)
  }

  const activeSprint = sprints.find((sprint) => sprint.status === SPRINT_ACTIVE)
  const plannedSprints = sprints.filter((sprint) => sprint.status === SPRINT_PLANNED)
  const backlogTickets = tickets.filter((ticket) => ticket.sprintId === null)
  const detailSprint = sprints.find((sprint) => sprint.id === detailSprintId) ?? null
  const completingSprint = sprints.find((sprint) => sprint.id === completingSprintId) ?? null

  const countText = sprints.length === 1 ? '1 sprint' : `${sprints.length} sprints`
  const activeText = activeSprint ? ` · ${activeSprint.name} en curso` : ''
  const meta = loadState === 'ready' ? `${countText}${activeText}` : null

  function handleSelectTicket(ticket) {
    setDetailTicketId(ticket.id)
  }

  return (
    <section>
      <PageHeader title="Sprints" meta={meta}>
        {canManage && (
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="shrink-0">
            <Plus className="size-4" aria-hidden="true" />
            Crear sprint
          </Button>
        )}
      </PageHeader>

      <LoadState
        state={loadState}
        loadingText="Cargando sprints…"
        errorText="No se pudieron cargar los sprints."
        onRetry={() => retryAll(sprintsQuery, ticketsQuery)}
        className="mt-4"
      />

      {loadState === 'ready' && sprints.length === 0 && (
        <EmptyState
          icon={CalendarRange}
          size="section"
          title="Todavía no hay sprints"
          description={canManage ? 'Creá el primer sprint para planificar el trabajo.' : 'Cuando se planifique el primero, aparece acá.'}
          action={
            canManage && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                Crear sprint
              </Button>
            )
          }
        />
      )}

      {loadState === 'ready' && sprints.length > 0 && (
        <SprintList
          sprints={sprints}
          tickets={tickets}
          activeSprint={activeSprint}
          canManage={canManage}
          backlogPath={projectPath(projectKey, 'backlog')}
          onSelectSprint={(sprint) => setDetailSprintId(sprint.id)}
          onStartSprint={handleStartSprint}
          onCompleteSprint={(sprint) => setCompletingSprintId(sprint.id)}
          onDeleteSprint={handleDeleteSprint}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {loadState === 'ready' && (
        <SprintBacklog tickets={backlogTickets} onSelectTicket={handleSelectTicket} />
      )}

      {canManage && (
        <CreateSprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />
      )}

      <AnimatePresence>
        {completingSprint && (
          <CompleteSprintModal
            key={completingSprint.id}
            projectId={projectId}
            sprint={completingSprint}
            tickets={tickets}
            plannedSprints={plannedSprints}
            onClose={() => setCompletingSprintId(null)}
          />
        )}
      </AnimatePresence>

      {/* Mounted only while a record is chosen: every opening seeds its form from scratch. */}
      <AnimatePresence>
        {detailSprint && (
          <SprintDetailModal
            key={detailSprint.id}
            sprint={detailSprint}
            tickets={tickets.filter((ticket) => ticket.sprintId === detailSprint.id)}
            canManage={canManage}
            onClose={() => setDetailSprintId(null)}
            onUpdateSprint={handleUpdateSprint}
            onDeleteSprint={handleDeleteSprint}
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
