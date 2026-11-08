import { useState } from 'react'

import { TicketBreakdownDone } from '@/components/tickets/TicketBreakdownDone/TicketBreakdownDone'
import { TicketBreakdownList } from '@/components/tickets/TicketBreakdownList/TicketBreakdownList'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/cn'
import { TICKET_CANCELLED, TICKET_DONE } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'
import { SEGMENT_CLASSES } from './TicketBreakdown.data'
import { pendingTickets, percentDone, statusBreakdown } from './TicketBreakdown.helpers'
import {
  BAR,
  BAR_EMPTY,
  CANCELLED_NOTE,
  COLUMNS,
  COLUMNS_WITH_ASIDE,
  DOT,
  DOT_HOLLOW,
  LEGEND,
  LEGEND_BUTTON,
  LEGEND_LABEL,
  LEGEND_POINTS,
  NOTES,
  PERCENT,
  PERCENT_DONE,
  ROOT,
  SEGMENT,
  SEGMENT_DIMMED,
  SUMMARY,
  TOTALS,
} from './TicketBreakdown.styles'

/**
 * What an epic or a sprint holds, as its expanded row shows it: how far along it is, where its
 * tickets stand, and a few of them.
 *
 * It replaced the full ticket list those rows used to unfold. An epic with forty tickets turned
 * that into a wall to scroll past; this stays the same height whatever the size, and "Ver todos
 * en el Backlog" opens the Backlog filtered to it for the whole list.
 *
 * The parts that differ between the two come in as props:
 * - `backlogHref`: the Backlog filtered to this epic or sprint ("/backlog?sprint=3").
 * - `note`: a note on the right of the totals (a sprint's capacity). When there is one, the
 *   cancelled count moves into the totals line, so the right side holds one thing only.
 * - `aside`: a column beside the list (the epic's EpicTypeProgress). Optional.
 * - `done`: what replaces the list once nothing is pending (a sprint's "Completar sprint").
 *   Without it, a plain "Todos los tickets están hechos" panel.
 * - `pendingTitle` / `pendingHint`: the list's heading while it shows the pending tickets (a
 *   completed sprint calls them "Sin terminar").
 *
 * The list shows what is pending until a status is picked in the legend; then it shows that
 * status, and picking it again goes back. `chosenStatus` is looked up in this render's
 * statuses, so if the last ticket of it changes status the list falls back to pending on its
 * own instead of showing an empty status.
 *
 * Motion: the percentage counts up while the bar draws itself (useCountUp, animate-wipe-in),
 * and counts again from where it was when a ticket changes status. Picking a status swaps the
 * list with the app's staggered reveal; on first opening the rows stay still, because the
 * panel itself is already moving. `hasSwitched` is what tells the two apart.
 *
 * Only called with at least one ticket: the rows keep their own empty state.
 */
export function TicketBreakdown({
  tickets,
  backlogHref,
  note,
  aside,
  done,
  pendingTitle = 'Pendientes',
  pendingHint = 'En curso primero, luego por hacer',
  onSelectTicket,
}) {
  const [chosenStatus, setChosenStatus] = useState(null)
  const [hasSwitched, setHasSwitched] = useState(false)

  const stats = summarizeTickets(tickets)
  const statuses = statusBreakdown(tickets)
  const chosen = statuses.find((entry) => entry.value === chosenStatus) ?? null
  const pending = pendingTickets(tickets)
  const isAllDone = stats.total > 0 && stats.completed === stats.total
  const shownPercent = useCountUp(percentDone(stats))

  /* "Hecho" leads the bar, so the green grows from the left like the percentage it shows.
     The legend keeps STATUS_ORDER: it reads as a list of what is happening, live work first. */
  const inBar = [
    ...statuses.filter((entry) => entry.value === TICKET_DONE),
    ...statuses.filter((entry) => entry.value !== TICKET_DONE && entry.value !== TICKET_CANCELLED),
  ]

  const cancelledText = stats.cancelled === 1 ? '1 cancelado' : `${stats.cancelled} cancelados`
  const showCancelled = stats.cancelled > 0 && stats.total > 0

  function toggleStatus(value) {
    setChosenStatus(chosen && chosen.value === value ? null : value)
    setHasSwitched(true)
  }

  // From the first row once the list has been switched at least once; null keeps rows still.
  const revealFrom = hasSwitched ? 0 : null

  function renderBody() {
    if (chosen) {
      return (
        <TicketBreakdownList
          key={chosen.value}
          revealFrom={revealFrom}
          title={chosen.label}
          hint="Filtrado desde la barra · clic de nuevo para quitar"
          tickets={tickets.filter((ticket) => ticket.status === chosen.value)}
          backlogHref={`${backlogHref}&status=${chosen.value}`}
          onSelectTicket={onSelectTicket}
        />
      )
    }

    if (pending.length === 0 && stats.total > 0) {
      return (
        done ?? (
          <TicketBreakdownDone
            title="Todos los tickets están hechos"
            text={`${stats.completed} ${stats.completed === 1 ? 'ticket' : 'tickets'} · ${stats.pointsCompleted} pts.`}
            backlogHref={backlogHref}
          />
        )
      )
    }

    return (
      <TicketBreakdownList
        key="pending"
        revealFrom={revealFrom}
        title={pendingTitle}
        hint={pendingHint}
        emptyText="Todos los tickets están cancelados."
        tickets={pending}
        backlogHref={backlogHref}
        onSelectTicket={onSelectTicket}
      />
    )
  }

  return (
    <div className={ROOT}>
      <div className={SUMMARY}>
        {stats.total > 0 ? (
          <>
            <p className={cn(PERCENT, isAllDone && PERCENT_DONE)}>{shownPercent}%</p>
            <p className={TOTALS}>
              {stats.completed} de {stats.total} {stats.total === 1 ? 'ticket' : 'tickets'} ·{' '}
              {stats.pointsCompleted} de {stats.points} pts
              {note && showCancelled && ` · ${cancelledText}`}
            </p>
          </>
        ) : (
          <p className={TOTALS}>Todos los tickets están cancelados.</p>
        )}
        <div className={NOTES}>
          {note}
          {!note && showCancelled && <p className={CANCELLED_NOTE}>{cancelledText} fuera del cálculo</p>}
        </div>
      </div>

      {/* Hidden from screen readers: the figures above and the legend below already say
          everything the bar draws, in words. */}
      <div className={cn(BAR, inBar.length === 0 && BAR_EMPTY)} aria-hidden="true">
        {inBar.map((entry) => (
          <span
            key={entry.value}
            className={cn(
              SEGMENT,
              SEGMENT_CLASSES[entry.value],
              chosen && chosen.value !== entry.value && SEGMENT_DIMMED,
            )}
            style={{ flexGrow: entry.count }}
          />
        ))}
      </div>

      <ul className={LEGEND} aria-label="Tickets por estado. Elegí uno para listarlo.">
        {statuses.map((entry) => (
          <li key={entry.value}>
            <button
              type="button"
              aria-pressed={chosen?.value === entry.value}
              onClick={() => toggleStatus(entry.value)}
              className={LEGEND_BUTTON}
            >
              <span
                className={cn(DOT, entry.value === TICKET_CANCELLED ? DOT_HOLLOW : SEGMENT_CLASSES[entry.value])}
                aria-hidden="true"
              />
              <span className={LEGEND_LABEL}>{entry.label}</span>
              <span className="text-label">{entry.count}</span>
              <span className={LEGEND_POINTS}>· {entry.points} pts</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={cn(COLUMNS, aside && COLUMNS_WITH_ASIDE)}>
        {renderBody()}
        {aside}
      </div>
    </div>
  )
}
