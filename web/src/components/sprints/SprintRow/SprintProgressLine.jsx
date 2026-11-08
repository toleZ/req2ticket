import { AnimatePresence, motion } from 'motion/react'

import { META } from '@/components/ui/ListRow/ListRow.styles'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { springSoft } from '@/lib/motion'
import { cancelledNote } from '@/lib/ticketStats'
import { completedSummary } from './SprintRow.helpers'
import { OVER_CAPACITY } from './SprintRow.styles'

/**
 * The line under a sprint's name: how far along it is, and its points against its capacity.
 *
 * Collapsed (`isVisible`), this line is the sprint's progress at a glance. Expanded, the
 * breakdown shows the same figures larger right below, so the line steps aside: it folds away
 * instead of vanishing.
 */
export function SprintProgressLine({ sprint, stats, isCompleted, isVisible }) {
  // The API's sum of the stories' and tasks' points; past the capacity, it says by how much.
  const overCapacity = sprint.committedPoints - sprint.capacity

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={springSoft}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            {isCompleted ? (
              // A finished sprint is history: what came out of it, not a progress bar.
              <span className={META}>{completedSummary(stats)}</span>
            ) : (
              <>
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
              </>
            )}
            {overCapacity > 0 ? (
              <span className={OVER_CAPACITY}>
                {sprint.committedPoints} / {sprint.capacity} pts · {overCapacity} sobre capacidad
              </span>
            ) : (
              <span className={META}>
                {sprint.committedPoints} / {sprint.capacity} pts
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
