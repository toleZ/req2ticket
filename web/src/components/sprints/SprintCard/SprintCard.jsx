import { useState } from 'react'
import { Calendar, CheckCheck, Flag, Trash2 } from 'lucide-react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList/TicketSummaryList'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { daysRemaining, formatDateRange } from '@/lib/dates'
import { findOption } from '@/lib/options'
import { SPRINT_ACTIVE, SPRINT_COMPLETED, SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { cancelledNote, summarizeTickets } from '@/lib/ticketStats'
import { remainingLabel } from './SprintCard.helpers'
import { CARD, DATES, EMPTY_NOTE, EXPAND_ROW, GOAL, PROGRESS_META, STAT_LABEL } from './SprintCard.styles'

export function SprintCard({ sprint, tickets, onUpdateSprint, onDeleteSprint, onSelectTicket }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const status = findOption(SPRINT_STATUS_OPTIONS, sprint.status)
  const daysLeft = daysRemaining(sprint.endDate)

  // `tickets` are the tickets assigned to this sprint, already filtered by the page: the
  // card never asks the API for them again.
  const stats = summarizeTickets(tickets)
  // How many committed points go past the sprint's capacity; 0 or less means it fits.
  const overCapacity = stats.points - sprint.capacity
  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-title3 text-label">{sprint.name}</h2>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            {sprint.status === SPRINT_ACTIVE && (
              <Badge tone={daysLeft < 0 ? 'orange' : 'neutral'}>{remainingLabel(daysLeft)}</Badge>
            )}
          </div>

          {sprint.goal && (
            <p className={GOAL}>
              <Flag className="mt-0.5 size-3.5 shrink-0 text-label-tertiary" aria-hidden="true" />
              {sprint.goal}
            </p>
          )}

          <p className={DATES}>
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            {formatDateRange(sprint.startDate, sprint.endDate)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setIsCompleteOpen(true)}
            disabled={sprint.status === SPRINT_COMPLETED}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Completar
          </Button>
          <IconButton
            label="Eliminar sprint"
            variant="danger"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-6">
        <div className="min-w-48 flex-1">
          <div className={PROGRESS_META}>
            <span>
              {stats.completed} de {stats.total} tickets completados
              {cancelledNote(stats)}
            </span>
            <span>{progressPct}%</span>
          </div>
          <ProgressBar
            value={stats.completed}
            max={stats.total}
            label={`Tickets completados: ${stats.completed} de ${stats.total}`}
            className="mt-1.5"
          />
        </div>

        {/* Two numbers that used to be two bare fractions side by side (0/10, 10/34) whose
            denominators meant different things. Now each says what it counts, and going over
            capacity is said in words, not only with a colour. */}
        <div className="flex shrink-0 gap-6">
          <div className="text-right">
            <p className={STAT_LABEL}>
              Puntos hechos
            </p>
            <p className="text-body font-semibold text-label">
              {stats.pointsCompleted} de {stats.points}
            </p>
          </div>
          <div className="text-right">
            <p className={STAT_LABEL}>
              Comprometidos
            </p>
            <p className={`text-body font-semibold ${overCapacity > 0 ? 'text-orange-text' : 'text-label'}`}>
              {stats.points} de {sprint.capacity}
            </p>
            {overCapacity > 0 && (
              <p className="text-caption text-orange-text">Excede por {overCapacity} pts</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className={EXPAND_ROW}
      >
        {isExpanded
          ? 'Ocultar tickets'
          : `Ver ${stats.all} ${stats.all === 1 ? 'ticket' : 'tickets'}`}
      </button>

      {isExpanded &&
        (stats.all === 0 ? (
          <p className={EMPTY_NOTE}>
            Todavía no hay tickets asignados a este sprint.
          </p>
        ) : (
          <div className="px-0.5 pb-0.5">
            <TicketSummaryList tickets={tickets} onSelectTicket={onSelectTicket} />
          </div>
        ))}

      <ConfirmModal
        isOpen={isCompleteOpen}
        title="Completar sprint"
        confirmLabel="Completar"
        pendingLabel="Completando…"
        confirmVariant="success"
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={() => onUpdateSprint(sprint, { status: 'completed' })}
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
