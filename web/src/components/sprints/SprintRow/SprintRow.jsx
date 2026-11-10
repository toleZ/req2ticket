import { useState } from 'react'
import { CalendarDays, ChevronRight, Flag, Trash2 } from 'lucide-react'

import { StartSprintModal } from '@/components/sprints/StartSprintModal/StartSprintModal'
import { Badge } from '@/components/ui/Badge/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { CHEVRON, EXPAND_BUTTON, ROW } from '@/components/ui/ListRow/ListRow.styles'
import { toast } from '@/components/ui/Toast/toast'
import { cn } from '@/lib/cn'
import { daysRemaining, formatDateRange } from '@/lib/dates'
import { findOption, SPRINT_ACTIVE, SPRINT_COMPLETED, SPRINT_PLANNED, SPRINT_STATUS_OPTIONS } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'
import { SprintAction } from './SprintAction'
import { SprintProgressLine } from './SprintProgressLine'
import { SprintRowPanel } from './SprintRowPanel'
import { remainingLabel } from './SprintRow.helpers'
import { DATES, GOAL, LINE_ICON, OPEN_BUTTON, OPEN_NAME } from './SprintRow.styles'

/**
 * A sprint in the list, drawn like an epic row: the chevron shows its breakdown, the name opens
 * SprintDetailModal, the second line says how far along it is, then the goal and the dates.
 *
 * The action button follows the sprint's life (ENT-5), and only with sprints.manage
 * (`canManage`): see SprintAction. Only a planned sprint can be deleted: the started ones are
 * history.
 *
 * This file keeps the state (expanded, the two confirmations); the pieces are SprintAction,
 * SprintProgressLine and SprintRowPanel, which only draw what they get.
 *
 *   sprints          every sprint of the project (starting one warns about overlapping dates)
 *   tickets          this sprint's tickets, already filtered by the page
 *   activeSprint     the project's active sprint, or undefined (the API allows one)
 *   ticketsPath      the project's Tickets page, which the breakdown filters to this sprint
 *   onStartSprint(sprint, { startDate, endDate })   returns the request's promise
 *   onCompleteSprint opens the page's CompleteSprintModal
 *   onDeleteSprint   returns the request's promise
 */
export function SprintRow({
  sprint,
  sprints,
  tickets,
  activeSprint,
  canManage,
  ticketsPath,
  onSelectSprint,
  onStartSprint,
  onCompleteSprint,
  onDeleteSprint,
  onSelectTicket,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isStartOpen, setIsStartOpen] = useState(false)

  const status = findOption(SPRINT_STATUS_OPTIONS, sprint.status)
  const daysLeft = daysRemaining(sprint.endDate)
  const ticketsHref = `${ticketsPath}?sprint=${sprint.id}`
  const stats = summarizeTickets(tickets)

  const isPlanned = sprint.status === SPRINT_PLANNED
  const isActive = sprint.status === SPRINT_ACTIVE
  const isCompleted = sprint.status === SPRINT_COMPLETED
  const isAllDone = stats.total > 0 && stats.completed === stats.total

  async function handleStart(dates) {
    await onStartSprint(sprint, dates)
    toast.success(`${sprint.name} está en curso`)
  }

  async function handleDelete() {
    await onDeleteSprint(sprint)
    toast.success(
      stats.all > 0
        ? `${sprint.name} borrado. Sus ${stats.all} tickets volvieron al backlog`
        : `${sprint.name} borrado`,
    )
  }

  // Everything SprintAction needs but where it sits: it is drawn twice (see below).
  const actionProps = {
    sprint,
    activeSprint,
    canManage,
    isAllDone,
    isEmpty: tickets.length === 0,
    onStart: () => setIsStartOpen(true),
    onComplete: () => onCompleteSprint(sprint),
  }

  return (
    <li className={ROW}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={isExpanded ? `Ocultar tickets de ${sprint.name}` : `Ver tickets de ${sprint.name}`}
          onClick={() => setIsExpanded(!isExpanded)}
          className={EXPAND_BUTTON}
        >
          <ChevronRight className={cn(CHEVRON, isExpanded && 'rotate-90')} aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          {/* The heading wraps the button and not the other way round, for the reason written
              in EpicRow: a heading inside a <button> never reaches the page outline. */}
          <h2 className="min-w-0">
            <button
              type="button"
              onClick={() => onSelectSprint(sprint)}
              aria-label={[`Abrir ${sprint.name}`, status?.label, formatDateRange(sprint.startDate, sprint.endDate)]
                .filter(Boolean)
                .join(' · ')}
              className={OPEN_BUTTON}
            >
              <span className={OPEN_NAME}>{sprint.name}</span>
              {status && <Badge tone={status.tone}>{status.label}</Badge>}
              {isActive && (
                <Badge tone={daysLeft < 0 ? 'orange' : 'neutral'}>{remainingLabel(daysLeft)}</Badge>
              )}
            </button>
          </h2>

          <SprintProgressLine sprint={sprint} stats={stats} isCompleted={isCompleted} isVisible={!isExpanded} />

          {/* The goal and the dates each get a line and an icon that says which is which. */}
          {sprint.goal && (
            <p className={GOAL}>
              <Flag className={LINE_ICON} aria-hidden="true" />
              {sprint.goal}
            </p>
          )}
          <p className={DATES}>
            <CalendarDays className={LINE_ICON} aria-hidden="true" />
            {formatDateRange(sprint.startDate, sprint.endDate)}
          </p>

          {/* Below sm the button goes under the text instead of beside it. */}
          <SprintAction {...actionProps} className="mt-2 sm:hidden" />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <SprintAction {...actionProps} className="hidden sm:inline-flex" />
          {/* Only a planned sprint can be deleted: active and completed ones are history. */}
          {canManage && isPlanned && (
            <IconButton label={`Eliminar ${sprint.name}`} variant="danger" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="size-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </div>

      <SprintRowPanel
        sprint={sprint}
        tickets={tickets}
        stats={stats}
        isOpen={isExpanded}
        isActive={isActive}
        isCompleted={isCompleted}
        daysLeft={daysLeft}
        canManage={canManage}
        ticketsHref={ticketsHref}
        onCompleteSprint={onCompleteSprint}
        onSelectTicket={onSelectTicket}
      />

      {canManage && isPlanned && (
        <>
          {isStartOpen && (
            <StartSprintModal
              sprint={sprint}
              sprints={sprints}
              onClose={() => setIsStartOpen(false)}
              onStart={handleStart}
            />
          )}

          <ConfirmModal
            isOpen={isDeleteOpen}
            title="Eliminar sprint"
            confirmLabel="Eliminar sprint"
            pendingLabel="Eliminando…"
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
          >
            <p>
              Se va a borrar <span className="font-medium text-label">{sprint.name}</span>.
              {stats.all === 1 && ' Su ticket vuelve al backlog.'}
              {stats.all > 1 && ` Sus ${stats.all} tickets vuelven al backlog.`} No se puede deshacer.
            </p>
          </ConfirmModal>
        </>
      )}
    </li>
  )
}
