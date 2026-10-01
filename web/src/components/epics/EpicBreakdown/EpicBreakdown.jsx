import { EpicPendingList } from '@/components/epics/EpicPendingList/EpicPendingList'
import { EpicTypeProgress } from '@/components/epics/EpicTypeProgress/EpicTypeProgress'
import { cn } from '@/lib/cn'
import { TICKET_CANCELLED } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'
import { SEGMENT_CLASSES } from './EpicBreakdown.data'
import { pendingTickets, percentDone, statusBreakdown } from './EpicBreakdown.helpers'
import {
  BAR,
  BAR_EMPTY,
  CANCELLED_NOTE,
  COLUMNS,
  DOT,
  DOT_HOLLOW,
  LEGEND,
  LEGEND_ITEM,
  LEGEND_LABEL,
  LEGEND_POINTS,
  PERCENT,
  ROOT,
  SEGMENT,
  SUMMARY,
  TOTALS,
} from './EpicBreakdown.styles'

/**
 * What an epic holds, as the expanded row shows it: how far along it is, where its tickets
 * stand, the few still pending and how each ticket type is doing.
 *
 * It replaces the full ticket list the row used to unfold. An epic with forty tickets turned
 * that into a wall to scroll past; this stays the same height whatever the epic's size, and
 * "Ver todos en el Backlog" opens the Backlog filtered to the epic for the whole list.
 *
 * Only called with at least one ticket: EpicRow keeps its own empty state.
 */
export function EpicBreakdown({ epic, tickets, onSelectTicket }) {
  const stats = summarizeTickets(tickets)
  const statuses = statusBreakdown(tickets)
  const inBar = statuses.filter((entry) => entry.value !== TICKET_CANCELLED)

  return (
    <div className={ROOT}>
      <div className={SUMMARY}>
        {stats.total > 0 ? (
          <>
            <p className={PERCENT}>{percentDone(stats)}%</p>
            <p className={TOTALS}>
              {stats.completed} de {stats.total} {stats.total === 1 ? 'ticket' : 'tickets'} ·{' '}
              {stats.pointsCompleted} de {stats.points} pts
            </p>
          </>
        ) : (
          <p className={TOTALS}>Todos los tickets de esta épica están cancelados.</p>
        )}
        {stats.cancelled > 0 && stats.total > 0 && (
          <p className={CANCELLED_NOTE}>
            {stats.cancelled === 1 ? '1 cancelado' : `${stats.cancelled} cancelados`} fuera del cálculo
          </p>
        )}
      </div>

      {/* Hidden from screen readers: the figures above and the legend below already say
          everything the bar draws, in words. */}
      <div className={cn(BAR, inBar.length === 0 && BAR_EMPTY)} aria-hidden="true">
        {inBar.map((entry) => (
          <span
            key={entry.value}
            className={cn(SEGMENT, SEGMENT_CLASSES[entry.value])}
            style={{ flexGrow: entry.count }}
          />
        ))}
      </div>

      <ul className={LEGEND} aria-label="Tickets por estado">
        {statuses.map((entry) => (
          <li key={entry.value} className={LEGEND_ITEM}>
            <span
              className={cn(DOT, entry.value === TICKET_CANCELLED ? DOT_HOLLOW : SEGMENT_CLASSES[entry.value])}
              aria-hidden="true"
            />
            <span className={LEGEND_LABEL}>{entry.label}</span>
            <span className="text-label">{entry.count}</span>
            <span className={LEGEND_POINTS}>· {entry.points} pts</span>
          </li>
        ))}
      </ul>

      <div className={COLUMNS}>
        <EpicPendingList
          epicId={epic.id}
          tickets={pendingTickets(tickets)}
          onSelectTicket={onSelectTicket}
        />
        <EpicTypeProgress tickets={tickets} />
      </div>
    </div>
  )
}
