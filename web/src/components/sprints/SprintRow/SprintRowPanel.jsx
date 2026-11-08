import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'

import { SprintCapacityNote } from '@/components/sprints/SprintCapacityNote/SprintCapacityNote'
import { SPRINT_BACKLOG_ID } from '@/components/sprints/SprintBacklog/SprintBacklog.data'
import { TicketBreakdown } from '@/components/tickets/TicketBreakdown/TicketBreakdown'
import { TicketBreakdownDone } from '@/components/tickets/TicketBreakdownDone/TicketBreakdownDone'
import { Button } from '@/components/ui/Button/Button'
import { BASE as BUTTON_BASE, SIZE_CLASSES as BUTTON_SIZES, VARIANT_CLASSES as BUTTON_VARIANTS } from '@/components/ui/Button/Button.styles'
import { PANEL } from '@/components/ui/ListRow/ListRow.styles'
import { cn } from '@/lib/cn'
import { springSoft } from '@/lib/motion'
import { remainingLabel, scrollToBacklog } from './SprintRow.helpers'
import { EMPTY_NOTE } from './SprintRow.styles'

/**
 * What the chevron unfolds under a sprint: its tickets, grouped by status (TicketBreakdown),
 * or a note when there are none yet. `isOpen` drives the unfold animation.
 */
export function SprintRowPanel({
  sprint,
  tickets,
  stats,
  isOpen,
  isActive,
  isCompleted,
  daysLeft,
  canManage,
  backlogHref,
  onCompleteSprint,
  onSelectTicket,
}) {
  /* What the breakdown shows instead of its list once nothing is pending. */
  function renderDone() {
    if (isCompleted) {
      return (
        <TicketBreakdownDone
          title="Se entregó todo lo comprometido"
          text={`${stats.completed} ${stats.completed === 1 ? 'ticket' : 'tickets'} · ${stats.pointsCompleted} pts entregados.`}
          backlogHref={backlogHref}
        />
      )
    }

    if (isActive) {
      return (
        <TicketBreakdownDone
          title="Todos los tickets están hechos"
          text={`${remainingLabel(daysLeft)}. Podés cerrar el sprint ahora o sumar algo del Backlog.`}
          backlogHref={backlogHref}
          actions={
            canManage && (
              <>
                <Button variant="success" size="sm" onClick={() => onCompleteSprint(sprint)}>
                  Completar sprint
                </Button>
                {/* A plain link to the Backlog block at the foot of this page, which is where a
                    ticket without a sprint gets one. */}
                <a
                  href={`#${SPRINT_BACKLOG_ID}`}
                  onClick={(event) => scrollToBacklog(event, SPRINT_BACKLOG_ID)}
                  className={cn(BUTTON_BASE, BUTTON_SIZES.sm, BUTTON_VARIANTS.neutral)}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Agregar del Backlog
                </a>
              </>
            )
          }
        />
      )
    }

    return undefined
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
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
                backlogHref={backlogHref}
                note={<SprintCapacityNote points={sprint.committedPoints} capacity={sprint.capacity} />}
                done={renderDone()}
                pendingTitle={isCompleted ? 'Sin terminar' : undefined}
                pendingHint={isCompleted ? 'Quedaron abiertos al cerrar el sprint' : undefined}
                onSelectTicket={onSelectTicket}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
