import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, CheckCheck, ChevronRight, Flag, Play, Plus, Trash2 } from 'lucide-react'

import { SprintCapacityNote } from '@/components/sprints/SprintCapacityNote/SprintCapacityNote'
import { SPRINT_BACKLOG_ID } from '@/components/sprints/SprintBacklog/SprintBacklog.data'
import { TicketBreakdown } from '@/components/tickets/TicketBreakdown/TicketBreakdown'
import { TicketBreakdownDone } from '@/components/tickets/TicketBreakdownDone/TicketBreakdownDone'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { BASE as BUTTON_BASE, SIZE_CLASSES as BUTTON_SIZES, VARIANT_CLASSES as BUTTON_VARIANTS } from '@/components/ui/Button/Button.styles'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { CHEVRON, EXPAND_BUTTON, META, PANEL, ROW } from '@/components/ui/ListRow/ListRow.styles'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { cn } from '@/lib/cn'
import { daysRemaining, formatDateRange } from '@/lib/dates'
import { springSoft } from '@/lib/motion'
import { findOption, SPRINT_ACTIVE, SPRINT_COMPLETED, SPRINT_PLANNED, SPRINT_STATUS_OPTIONS } from '@/lib/options'
import { cancelledNote, summarizeTickets } from '@/lib/ticketStats'
import { remainingLabel, scrollToBacklog } from './SprintRow.helpers'
import { BLOCKED_NOTE, DATES, EMPTY_NOTE, GOAL, LINE_ICON, OPEN_BUTTON, OPEN_NAME, OVER_CAPACITY } from './SprintRow.styles'

/**
 * A sprint in the list, drawn like an epic row: the chevron shows its breakdown, the name opens
 * SprintDetailModal, the second line says how far along it is, then the goal and the dates.
 *
 * Expanded, the breakdown (TicketBreakdown) carries the sprint's capacity as its note and, once
 * nothing is pending, a panel that fits the sprint's moment: an active sprint offers to be
 * completed or to take more from the Backlog; a completed one says everything was delivered.
 *
 * The action button follows the sprint's life: a planned sprint shows "Iniciar", an active one
 * "Completar", a finished one nothing. Other jumps (reopening, completing a sprint that never
 * started) are still possible from the sheet's status select, on purpose and not by accident.
 *
 * `activeSprint` is the project's active sprint, or undefined. The API allows only one, so
 * while another sprint holds it "Iniciar" is disabled and a line under the goal says which.
 */
export function SprintRow({
  sprint,
  tickets,
  activeSprint,
  onSelectSprint,
  onUpdateSprint,
  onDeleteSprint,
  onSelectTicket,
}) {
  const panelId = useId()
  const blockedId = useId()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const status = findOption(SPRINT_STATUS_OPTIONS, sprint.status)
  const daysLeft = daysRemaining(sprint.endDate)

  // `tickets` are the tickets assigned to this sprint, already filtered by the page: the
  // row never asks the API for them again.
  const stats = summarizeTickets(tickets)
  // How many committed points go past the sprint's capacity; 0 or less means it fits.
  const overCapacity = stats.points - sprint.capacity

  const canStart = sprint.status === SPRINT_PLANNED
  const isStartBlocked = canStart && Boolean(activeSprint)
  const canComplete = sprint.status === SPRINT_ACTIVE
  // Every counted ticket done: "Completar" turns green, it is now the obvious next step.
  const isAllDone = stats.total > 0 && stats.completed === stats.total

  /* The button is drawn twice, below the text under sm and beside it from sm up (see the
     comment where they are placed), so it is written once here. */
  function renderAction(className) {
    if (canStart) {
      return (
        <Button
          variant="neutral"
          size="sm"
          disabled={isStartBlocked}
          ariaDescribedBy={isStartBlocked ? blockedId : undefined}
          onClick={() => setIsStartOpen(true)}
          className={className}
        >
          <Play className="size-4" aria-hidden="true" />
          Iniciar
        </Button>
      )
    }

    if (canComplete) {
      return (
        <Button
          variant={isAllDone ? 'success' : 'neutral'}
          size="sm"
          onClick={() => setIsCompleteOpen(true)}
          className={className}
        >
          <CheckCheck className="size-4" aria-hidden="true" />
          Completar
        </Button>
      )
    }

    return null
  }

  /* What the breakdown shows instead of its list once nothing is pending. A planned sprint
     with everything done is odd enough to get the breakdown's plain panel (undefined). */
  function renderDone() {
    if (sprint.status === SPRINT_COMPLETED) {
      return (
        <TicketBreakdownDone
          title="Se entregó todo lo comprometido"
          text={`${stats.completed} ${stats.completed === 1 ? 'ticket' : 'tickets'} · ${stats.pointsCompleted} pts entregados.`}
          backlogHref={`/backlog?sprint=${sprint.id}`}
        />
      )
    }

    if (sprint.status === SPRINT_ACTIVE) {
      return (
        <TicketBreakdownDone
          title="Todos los tickets están hechos"
          text={`${remainingLabel(daysLeft)}. Podés cerrar el sprint ahora o sumar algo del Backlog.`}
          backlogHref={`/backlog?sprint=${sprint.id}`}
          actions={
            <>
              <Button variant="success" size="sm" onClick={() => setIsCompleteOpen(true)}>
                Completar sprint
              </Button>
              {/* A plain link to the Backlog block at the foot of this page, which is where a
                  ticket without a sprint gets one. Drawn as a button because it reads as the
                  second of two choices. */}
              <a
                href={`#${SPRINT_BACKLOG_ID}`}
                onClick={(event) => scrollToBacklog(event, SPRINT_BACKLOG_ID)}
                className={cn(BUTTON_BASE, BUTTON_SIZES.sm, BUTTON_VARIANTS.neutral)}
              >
                <Plus className="size-4" aria-hidden="true" />
                Agregar del Backlog
              </a>
            </>
          }
        />
      )
    }

    return undefined
  }

  return (
    <li className={ROW}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={isExpanded ? `Ocultar tickets de ${sprint.name}` : `Ver tickets de ${sprint.name}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={panelId}
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
              {sprint.status === SPRINT_ACTIVE && (
                <Badge tone={daysLeft < 0 ? 'orange' : 'neutral'}>{remainingLabel(daysLeft)}</Badge>
              )}
            </button>
          </h2>

          {/* Collapsed, this line is the sprint's progress at a glance. Expanded, the breakdown
              shows the same figures larger right below, so the line steps aside.
              It folds away with the panel's own spring (and opens back with it), so the
              lines under it glide up instead of jumping while the breakdown opens. The gap
              above it is padding inside the fold, not a margin: a margin would still jump. */}
          <AnimatePresence initial={false}>
            {!isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={springSoft}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <span className={META}>
                    {stats.completed}/{stats.total} {stats.total === 1 ? 'ticket' : 'tickets'}
                    {cancelledNote(stats)} · {stats.pointsCompleted}/{stats.points} pts
                  </span>
                  <ProgressBar
                    value={stats.completed}
                    max={stats.total}
                    size="sm"
                    label={`Tickets completados: ${stats.completed} de ${stats.total}`}
                    className="w-20"
                  />
                  {overCapacity > 0 ? (
                    <span className={OVER_CAPACITY}>
                      Excede la capacidad ({sprint.capacity} pts) por {overCapacity} pts
                    </span>
                  ) : (
                    <span className={META}>Capacidad {sprint.capacity} pts</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The goal and the dates each get a line and an icon that says which is which:
              side by side with the name, the dates read as part of the title. */}
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

          {isStartBlocked && (
            <p id={blockedId} className={BLOCKED_NOTE}>
              Para iniciarlo, completá antes {activeSprint.name}.
            </p>
          )}

          {/* Below sm the button goes under the text instead of beside it: next to the delete
              icon it squeezed the row's text into a column a few words wide. */}
          {renderAction('mt-2 sm:hidden')}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {renderAction('hidden sm:inline-flex')}
          <IconButton
            label={`Eliminar ${sprint.name}`}
            variant="danger"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSoft}
            className="overflow-hidden"
          >
            <div className={cn(PANEL, 'pt-4')}>
              {stats.all === 0 ? (
                <p className={EMPTY_NOTE}>Todavía no hay tickets asignados a este sprint.</p>
              ) : (
                <TicketBreakdown
                  tickets={tickets}
                  backlogHref={`/backlog?sprint=${sprint.id}`}
                  note={<SprintCapacityNote points={stats.points} capacity={sprint.capacity} />}
                  done={renderDone()}
                  pendingTitle={sprint.status === SPRINT_COMPLETED ? 'Sin terminar' : undefined}
                  pendingHint={sprint.status === SPRINT_COMPLETED ? 'Quedaron abiertos al cerrar el sprint' : undefined}
                  onSelectTicket={onSelectTicket}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isStartOpen}
        title="Iniciar sprint"
        confirmLabel="Iniciar"
        pendingLabel="Iniciando…"
        confirmVariant="primary"
        onClose={() => setIsStartOpen(false)}
        onConfirm={() => onUpdateSprint(sprint, { status: SPRINT_ACTIVE })}
      >
        ¿Iniciar <span className="font-medium text-label">"{sprint.name}"</span>? Pasa a ser el
        sprint activo hasta que lo completes.
      </ConfirmModal>

      <ConfirmModal
        isOpen={isCompleteOpen}
        title="Completar sprint"
        confirmLabel="Completar"
        pendingLabel="Completando…"
        confirmVariant="success"
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={() => onUpdateSprint(sprint, { status: SPRINT_COMPLETED })}
      >
        ¿Marcar <span className="font-medium text-label">"{sprint.name}"</span> como completado?
        Si hace falta, el estado se puede cambiar después desde el sprint.
      </ConfirmModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Eliminar sprint"
        confirmLabel="Eliminar"
        pendingLabel="Eliminando…"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDeleteSprint(sprint)}
      >
        ¿Seguro que querés eliminar <span className="font-medium text-label">"{sprint.name}"</span>?
        Esta acción no se puede deshacer.
      </ConfirmModal>
    </li>
  )
}
