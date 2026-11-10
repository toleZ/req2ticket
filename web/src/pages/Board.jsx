import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { CalendarRange, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BoardDnd } from '@/components/board/BoardDnd/BoardDnd'
import { BoardFilters } from '@/components/board/BoardFilters/BoardFilters'
import { BoardHeader } from '@/components/board/BoardHeader/BoardHeader'
import { BOARD_COLUMNS, INITIAL_FILTERS, filterBoardTickets } from '@/components/board/board.helpers'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CompleteSprintModal } from '@/components/sprints/CompleteSprintModal/CompleteSprintModal'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal/TicketDetailModal'
import { Button } from '@/components/ui/Button/Button'
import { BASE, SIZE_CLASSES, VARIANT_CLASSES } from '@/components/ui/Button/Button.styles'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { toast } from '@/components/ui/Toast/toast'
import { useCurrentProject } from '@/hooks/useCurrentProject'
import { readSession } from '@/lib/auth'
import { projectPath } from '@/lib/navItems'
import { SPRINT_ACTIVE, SPRINT_PLANNED } from '@/lib/options'
import { PERMISSIONS } from '@/lib/permissions'
import { useMoveTicket } from '@/lib/queries/board'
import { useEpics } from '@/lib/queries/epics'
import { loadStateOf, retryAll } from '@/lib/queries/loadState'
import { useMembers } from '@/lib/queries/members'
import { useSprints } from '@/lib/queries/sprints'
import { useTickets } from '@/lib/queries/tickets'
import { useWorkflow } from '@/lib/queries/workflow'
import { isFinalStatus, labelOf } from '@/lib/workflow'

/**
 * The board of the active sprint (BOARD-1): one column per status, one card per ticket.
 * Dragging a card to another column changes its status — at once on screen, and back with the
 * API's reason if the API says no (useMoveTicket).
 *
 * The cards come from the project's one list of tickets, the same the Backlog reads: moving a
 * card here is already moved there.
 */
export function Board() {
  const { projectId, projectKey, can } = useCurrentProject()
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [openTicketId, setOpenTicketId] = useState(null)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState(null) // { ticket, status } waiting for "Cambiar estado"

  const sprints = useSprints(projectId)
  const tickets = useTickets(projectId)
  const workflow = useWorkflow(projectId)
  const epics = useEpics(projectId)
  const members = useMembers(projectId)
  const moveTicket = useMoveTicket(projectId)

  const canWrite = can(PERMISSIONS.TICKETS_WRITE)
  const loadState = loadStateOf(sprints, tickets, workflow, epics, members)
  const currentUserId = readSession()?.user?.id

  // While a move is being saved, that card cannot be dragged again (FIX-2).
  const savingId = moveTicket.isPending ? moveTicket.variables?.ticketId : null

  /* A status with no way out under the workflow asks first (pendingMove holds it meanwhile);
     any other move saves at once. The optimistic move starts only once confirmed. */
  function requestMove(ticket, status) {
    if (isFinalStatus(workflow.data, status)) setPendingMove({ ticket, status })
    else saveMove(ticket, status)
  }

  function saveMove(ticket, status) {
    moveTicket.mutate(
      { ticketId: ticket.id, status },
      status === 'cancelled'
        ? { onSuccess: () => toast.success(`${ticket.code} cancelado. Sigue en Tickets.`) }
        : undefined,
    )
  }

  if (loadState !== 'ready') {
    return (
      <section>
        <PageHeader title="Tablero" />
        <LoadState
          state={loadState}
          loadingText="Cargando el tablero…"
          errorText="No se pudo cargar el tablero."
          onRetry={() => retryAll(sprints, tickets, workflow, epics, members)}
        />
      </section>
    )
  }

  const activeSprint = sprints.data.find((sprint) => sprint.status === SPRINT_ACTIVE)

  if (!activeSprint) {
    return (
      <section>
        <PageHeader title="Tablero" />
        <EmptyState
          icon={CalendarRange}
          title="No hay un sprint activo"
          description="El tablero muestra el sprint en curso. Iniciá uno planificado desde el Backlog."
          action={
            <Link to={projectPath(projectKey, 'backlog')} className={`${BASE} ${SIZE_CLASSES.md} ${VARIANT_CLASSES.primary}`}>
              Ir al Backlog
            </Link>
          }
        />
      </section>
    )
  }

  const sprintTickets = tickets.data.filter((ticket) => ticket.sprintId === activeSprint.id)
  const visible = filterBoardTickets(sprintTickets, filters, currentUserId)
  const onBoard = visible.filter((ticket) => ticket.status !== 'cancelled')
  const plannedSprints = sprints.data.filter((sprint) => sprint.status === SPRINT_PLANNED)

  return (
    // grow + flex-col: the board takes the rest of the screen, so its columns reach the bottom.
    <section className="flex grow flex-col">
      <PageHeader title="Tablero" />

      <BoardHeader
        sprint={activeSprint}
        tickets={sprintTickets}
        action={
          can(PERMISSIONS.SPRINTS_MANAGE) && (
            <Button variant="neutral" onClick={() => setIsCompleteOpen(true)} className="shrink-0">
              Completar sprint
            </Button>
          )
        }
      />

      {sprintTickets.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Este sprint no tiene tickets"
          description="Agregalos desde el Backlog."
          action={
            <Link to={projectPath(projectKey, 'backlog')} className={`${BASE} ${SIZE_CLASSES.md} ${VARIANT_CLASSES.neutral}`}>
              Ir al Backlog
            </Link>
          }
        />
      ) : (
        <>
          <BoardFilters filters={filters} epics={epics.data} members={members.data} onChange={setFilters} />

          {!canWrite && (
            <p className="mb-3 text-footnote text-label-secondary">
              Tu rol no puede mover tarjetas: tocá una para ver su detalle.
            </p>
          )}

          <BoardDnd
            columns={BOARD_COLUMNS}
            tickets={onBoard}
            allTickets={tickets.data}
            workflow={workflow.data}
            epics={epics.data}
            members={members.data}
            canWrite={canWrite}
            savingId={savingId}
            onMove={requestMove}
            onCancel={(ticket) => requestMove(ticket, 'cancelled')}
            onOpen={(ticket) => setOpenTicketId(ticket.id)}
          />
        </>
      )}

      {/* Mounted only while open, keyed by the ticket, so each opens with its own fresh state. */}
      <AnimatePresence>
        {openTicketId && (
          <TicketDetailModal
            key={openTicketId}
            projectId={projectId}
            ticketId={openTicketId}
            canWrite={canWrite}
            canDelete={can(PERMISSIONS.TICKETS_DELETE)}
            onClose={() => setOpenTicketId(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={pendingMove !== null}
        title="Cambiar a un estado final"
        confirmLabel="Cambiar estado"
        onClose={() => setPendingMove(null)}
        onConfirm={() => {
          saveMove(pendingMove.ticket, pendingMove.status)
          setPendingMove(null)
        }}
      >
        {pendingMove && (
          <p>
            {pendingMove.ticket.code} va a pasar a {labelOf(pendingMove.status)} y el workflow no permite volver
            atrás.
          </p>
        )}
      </ConfirmModal>

      {isCompleteOpen && (
        <CompleteSprintModal
          projectId={projectId}
          sprint={activeSprint}
          tickets={tickets.data}
          plannedSprints={plannedSprints}
          onClose={() => setIsCompleteOpen(false)}
        />
      )}
    </section>
  )
}
