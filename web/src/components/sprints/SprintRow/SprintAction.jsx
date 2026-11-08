import { CheckCheck, Play } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { SPRINT_ACTIVE, SPRINT_PLANNED } from '@/lib/options'

/**
 * The button that moves a sprint along its life (ENT-5): "Iniciar" on a planned sprint —
 * disabled, with the reason, while another one is active —, "Completar" on the active one, and
 * nothing on a completed one. Nothing either without sprints.manage (`canManage`).
 *
 * SprintRow draws it twice, below the text under sm and beside it from sm up: `className` says
 * which of the two it is.
 */
export function SprintAction({ sprint, activeSprint, canManage, isAllDone, className, onStart, onComplete }) {
  if (!canManage) return null

  if (sprint.status === SPRINT_PLANNED && activeSprint) {
    return (
      <span className={className}>
        <Tooltip label={`Ya hay un sprint activo: ${activeSprint.name}`} wrapsDisabled>
          <Button variant="neutral" size="sm" disabled>
            <Play className="size-4" aria-hidden="true" />
            Iniciar
          </Button>
        </Tooltip>
      </span>
    )
  }

  if (sprint.status === SPRINT_PLANNED) {
    return (
      <Button variant="neutral" size="sm" onClick={onStart} className={className}>
        <Play className="size-4" aria-hidden="true" />
        Iniciar
      </Button>
    )
  }

  if (sprint.status === SPRINT_ACTIVE) {
    return (
      // Every counted ticket done: "Completar" turns green, it is now the obvious next step.
      <Button variant={isAllDone ? 'success' : 'neutral'} size="sm" onClick={onComplete} className={className}>
        <CheckCheck className="size-4" aria-hidden="true" />
        Completar
      </Button>
    )
  }

  return null
}
