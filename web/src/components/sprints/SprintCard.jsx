import { useState } from 'react'
import { Calendar, CheckCheck, Flag, Trash2 } from 'lucide-react'

import { StoryList } from '@/components/features/StoryList'
import { CompleteSprintModal } from '@/components/sprints/CompleteSprintModal'
import { DeleteSprintModal } from '@/components/sprints/DeleteSprintModal'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { daysRemaining, formatDateRange } from '@/lib/dates'
import { findOption } from '@/lib/epicOptions'
import { SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { summarizeStories } from '@/lib/storyStats'

const COMPLETE_BUTTON = `inline-flex shrink-0 items-center gap-1.5 rounded-control bg-fill-tertiary
  px-3 py-1.5 text-footnote font-medium text-label transition-colors duration-fast
  hover:bg-fill-secondary disabled:pointer-events-none disabled:opacity-0`

const DELETE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast hover:bg-red/12 hover:text-red`

const TOGGLE_BUTTON = `mt-3 w-full border-t border-separator pt-3 text-left text-subheadline
  text-label-secondary transition-colors duration-fast hover:text-label`

export function SprintCard({ sprint, stories, onUpdateSprint, onDeleteSprint }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const status = findOption(SPRINT_STATUS_OPTIONS, sprint.status)
  const daysLeft = daysRemaining(sprint.endDate)

  // `stories` son las historias que tienen este sprint asignado, ya filtradas por la
  // página: la card no vuelve a pedirlas a la API.
  const stats = summarizeStories(stories)
  const ticketsTotal = stats.total
  const ticketsCompleted = stats.completed
  const pointsCompleted = stats.pointsCompleted
  const pointsAssigned = stats.points
  const progressPct = ticketsTotal > 0 ? Math.round((ticketsCompleted / ticketsTotal) * 100) : 0

  return (
    <li className="rounded-card bg-elevated p-5 shadow-card ring-[0.5px] ring-separator">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-title3 text-label">{sprint.name}</h3>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            {sprint.status === 'active' && daysLeft >= 0 && (
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
            disabled={sprint.status === 'completed'}
            className={COMPLETE_BUTTON}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Completar
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            aria-label="Eliminar sprint"
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
              {ticketsCompleted} de {ticketsTotal} historias completadas
            </span>
            <span>{progressPct}%</span>
          </div>
          <ProgressBar value={ticketsCompleted} max={ticketsTotal} className="mt-1.5" />
        </div>

        <div className="flex shrink-0 gap-6">
          <div className="text-right">
            <p className="text-caption font-medium tracking-wide text-label-tertiary uppercase">
              Puntos
            </p>
            <p className="text-body font-semibold text-label">
              {pointsCompleted}/{pointsAssigned}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption font-medium tracking-wide text-label-tertiary uppercase">
              Capacidad
            </p>
            <p className="text-body font-semibold text-label">
              {pointsAssigned}/{sprint.capacity}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
        className={TOGGLE_BUTTON}
      >
        {isExpanded
          ? 'Ocultar historias'
          : `Ver ${ticketsTotal} ${ticketsTotal === 1 ? 'historia' : 'historias'}`}
      </button>

      {isExpanded &&
        (ticketsTotal === 0 ? (
          <p className="px-0.5 pb-0.5 text-footnote text-label-tertiary">
            Todavía no hay historias asignadas a este sprint.
          </p>
        ) : (
          <div className="px-0.5 pb-0.5">
            <StoryList stories={stories} />
          </div>
        ))}

      <CompleteSprintModal
        isOpen={isCompleteOpen}
        sprintName={sprint.name}
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={() => onUpdateSprint(sprint, { status: 'completed' })}
      />

      <DeleteSprintModal
        isOpen={isDeleteOpen}
        sprintName={sprint.name}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDeleteSprint(sprint)}
      />
    </li>
  )
}
