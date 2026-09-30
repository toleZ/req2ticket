import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCheck, ChevronRight, Play, Trash2 } from 'lucide-react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList/TicketSummaryList'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { CHEVRON, EXPAND_BUTTON, META, PANEL, PANEL_LABEL, ROW } from '@/components/ui/ListRow/ListRow.styles'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { cn } from '@/lib/cn'
import { daysRemaining, formatDateRange } from '@/lib/dates'
import { springSoft } from '@/lib/motion'
import { findOption, SPRINT_ACTIVE, SPRINT_COMPLETED, SPRINT_PLANNED, SPRINT_STATUS_OPTIONS } from '@/lib/options'
import { cancelledNote, summarizeTickets } from '@/lib/ticketStats'
import { remainingLabel } from './SprintRow.helpers'
import { BLOCKED_NOTE, DATES, EMPTY_NOTE, GOAL, OPEN_BUTTON, OPEN_NAME, OVER_CAPACITY } from './SprintRow.styles'

/**
 * A sprint in the list, drawn like an epic row: the chevron shows its tickets, the name opens
 * SprintDetailModal, the second line says how far along it is, and the goal closes it.
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
        <Button variant="neutral" size="sm" onClick={() => setIsCompleteOpen(true)} className={className}>
          <CheckCheck className="size-4" aria-hidden="true" />
          Completar
        </Button>
      )
    }

    return null
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
              <span className={DATES}>{formatDateRange(sprint.startDate, sprint.endDate)}</span>
            </button>
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
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

          {sprint.goal && <p className={GOAL}>{sprint.goal}</p>}

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
            <div className={PANEL}>
              <p className={PANEL_LABEL}>Tickets</p>
              {stats.all === 0 ? (
                <p className={EMPTY_NOTE}>Todavía no hay tickets asignados a este sprint.</p>
              ) : (
                <div className="mt-1.5">
                  <TicketSummaryList tickets={tickets} onSelectTicket={onSelectTicket} />
                </div>
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
