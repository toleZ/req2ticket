import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCheck, ChevronRight, Trash2 } from 'lucide-react'

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
import { findOption } from '@/lib/options'
import { SPRINT_ACTIVE, SPRINT_COMPLETED, SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { cancelledNote, summarizeTickets } from '@/lib/ticketStats'
import { remainingLabel } from './SprintRow.helpers'
import { DATES, EMPTY_NOTE, GOAL, NAME, OVER_CAPACITY } from './SprintRow.styles'

/**
 * A sprint in the list, drawn like an epic row: the chevron shows its tickets, the first
 * line says what it is and when, the second how far along it is, and the goal closes it.
 *
 * "Completar" only shows while the sprint can still be completed. A finished sprint keeps
 * just the delete button: a disabled "Completar" next to a "Completado" badge said the same
 * thing twice and looked like something you could still do.
 */
export function SprintRow({ sprint, tickets, onUpdateSprint, onDeleteSprint, onSelectTicket }) {
  const panelId = useId()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const status = findOption(SPRINT_STATUS_OPTIONS, sprint.status)
  const daysLeft = daysRemaining(sprint.endDate)

  // `tickets` are the tickets assigned to this sprint, already filtered by the page: the
  // row never asks the API for them again.
  const stats = summarizeTickets(tickets)
  // How many committed points go past the sprint's capacity; 0 or less means it fits.
  const overCapacity = stats.points - sprint.capacity
  const canComplete = sprint.status !== SPRINT_COMPLETED

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
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={NAME}>{sprint.name}</h2>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            {sprint.status === SPRINT_ACTIVE && (
              <Badge tone={daysLeft < 0 ? 'orange' : 'neutral'}>{remainingLabel(daysLeft)}</Badge>
            )}
            <span className={DATES}>{formatDateRange(sprint.startDate, sprint.endDate)}</span>
          </div>

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

          {/* Below sm the button goes under the text instead of beside it: next to the delete
              icon it squeezed the row's text into a column a few words wide. */}
          {canComplete && (
            <Button variant="neutral" size="sm" onClick={() => setIsCompleteOpen(true)} className="mt-2 sm:hidden">
              <CheckCheck className="size-4" aria-hidden="true" />
              Completar
            </Button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {canComplete && (
            <Button variant="neutral" size="sm" onClick={() => setIsCompleteOpen(true)} className="hidden sm:inline-flex">
              <CheckCheck className="size-4" aria-hidden="true" />
              Completar
            </Button>
          )}
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
        isOpen={isCompleteOpen}
        title="Completar sprint"
        confirmLabel="Completar"
        pendingLabel="Completando…"
        confirmVariant="success"
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={() => onUpdateSprint(sprint, { status: SPRINT_COMPLETED })}
      >
        ¿Marcar <span className="font-medium text-label">"{sprint.name}"</span> como completado?
        Una vez completado no se puede volver a un estado anterior desde acá.
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
