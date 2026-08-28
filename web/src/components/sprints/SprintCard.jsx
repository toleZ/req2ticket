import { useState } from 'react'
import { Calendar, CheckCheck, Flag, Trash2 } from 'lucide-react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { daysRemaining, formatDateRange } from '@/lib/dates'
import { findOption } from '@/lib/options'
import { SPRINT_ACTIVE, SPRINT_COMPLETED, SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { summarizeTickets } from '@/lib/ticketStats'

const TOGGLE_BUTTON = `mt-3 w-full border-t border-separator pt-3 text-left text-subheadline
  text-label-secondary transition-colors duration-fast hover:text-label`

/* Smaller than the page-level buttons: this one sits in the card's header row. */
const COMPLETE_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-fill-tertiary px-3 py-1.5 text-footnote font-medium text-label transition-colors
  duration-fast hover:bg-fill-secondary disabled:opacity-50`

const DELETE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast ease-out-quad hover:bg-red/12 hover:text-red
  disabled:opacity-50`

export function SprintCard({ sprint, tickets, onUpdateSprint, onDeleteSprint }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const status = findOption(SPRINT_STATUS_OPTIONS, sprint.status)
  const daysLeft = daysRemaining(sprint.endDate)

  // `tickets` are the tickets assigned to this sprint, already filtered by the page: the
  // card never asks the API for them again.
  const stats = summarizeTickets(tickets)
  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <li className="rounded-card bg-elevated p-5 shadow-card ring-[0.5px] ring-separator">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-title3 text-label">{sprint.name}</h3>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            {sprint.status === SPRINT_ACTIVE && daysLeft >= 0 && (
              <Badge tone="neutral">Quedan {daysLeft} días</Badge>
            )}
          </div>

          {sprint.goal && (
            <p className="mt-1.5 flex items-start gap-1.5 text-body text-label-secondary">
              <Flag className="mt-0.5 size-3.5 shrink-0 text-label-tertiary" aria-hidden="true" />
              {sprint.goal}
            </p>
          )}

          <p className="mt-1 flex items-center gap-1.5 text-footnote text-label-tertiary">
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            {formatDateRange(sprint.startDate, sprint.endDate)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCompleteOpen(true)}
            disabled={sprint.status === SPRINT_COMPLETED}
            className={COMPLETE_BUTTON}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Completar
          </button>
          <button
            type="button"
            aria-label="Eliminar sprint"
            onClick={() => setIsDeleteOpen(true)}
            className={DELETE_BUTTON}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-6">
        <div className="min-w-48 flex-1">
          <div className="flex items-center justify-between text-footnote text-label-secondary">
            <span>
              {stats.completed} de {stats.total} tickets completados
            </span>
            <span>{progressPct}%</span>
          </div>
          <ProgressBar value={stats.completed} max={stats.total} className="mt-1.5" />
        </div>

        <div className="flex shrink-0 gap-6">
          <div className="text-right">
            <p className="text-caption font-medium tracking-wide text-label-tertiary uppercase">
              Puntos
            </p>
            <p className="text-body font-semibold text-label">
              {stats.pointsCompleted}/{stats.points}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption font-medium tracking-wide text-label-tertiary uppercase">
              Capacidad
            </p>
            <p className="text-body font-semibold text-label">
              {stats.points}/{sprint.capacity}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className={TOGGLE_BUTTON}
      >
        {isExpanded
          ? 'Ocultar tickets'
          : `Ver ${stats.total} ${stats.total === 1 ? 'ticket' : 'tickets'}`}
      </button>

      {isExpanded &&
        (stats.total === 0 ? (
          <p className="px-0.5 pb-0.5 text-footnote text-label-tertiary">
            Todavía no hay tickets asignados a este sprint.
          </p>
        ) : (
          <div className="px-0.5 pb-0.5">
            <TicketSummaryList tickets={tickets} />
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
