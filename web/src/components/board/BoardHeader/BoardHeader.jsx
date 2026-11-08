import { remainingText } from '@/components/board/board.helpers'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { daysRemaining, formatDateRange } from '@/lib/dates'
import { TICKET_DONE } from '@/lib/options'
import { HEADER, META, POINTS, TITLE } from './BoardHeader.styles'

/**
 * Where the sprint stands: its name and goal, its dates, how many days are left, and the points
 * done against the points committed.
 *
 * Committed points are the API's: the points of the sprint's stories and tasks, cancelled ones
 * left out. Done points add the same over the tickets already done. The capacity is shown apart,
 * as the reference the team planned against.
 */
export function BoardHeader({ sprint, tickets, action }) {
  const days = daysRemaining(sprint.endDate)
  const donePoints = tickets
    .filter((ticket) => ticket.status === TICKET_DONE)
    .reduce((sum, ticket) => sum + (ticket.points ?? 0), 0)

  return (
    <section className={HEADER} aria-label="Sprint activo">
      <div className="min-w-0 flex-1">
        <h2 className={TITLE}>{sprint.name}</h2>
        {sprint.goal && <p className="mt-0.5 text-body text-label-secondary">{sprint.goal}</p>}
        <p className={META}>
          <span>{formatDateRange(sprint.startDate, sprint.endDate)}</span>
          <span aria-hidden="true">·</span>
          <span className={days < 0 ? 'font-medium text-orange-text' : undefined}>{remainingText(days)}</span>
          <span aria-hidden="true">·</span>
          <span>Capacidad {sprint.capacity} pts</span>
        </p>
      </div>

      <div className="flex w-full flex-col gap-1.5 sm:w-64">
        <p className={POINTS}>
          <span className="font-semibold text-label">
            {donePoints} / {sprint.committedPoints} pts
          </span>{' '}
          completados
        </p>
        <ProgressBar
          value={donePoints}
          max={sprint.committedPoints}
          tone="green"
          label={`${donePoints} de ${sprint.committedPoints} puntos completados`}
        />
      </div>

      {action}
    </section>
  )
}
