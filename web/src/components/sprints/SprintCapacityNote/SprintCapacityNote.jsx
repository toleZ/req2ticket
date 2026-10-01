import { TriangleAlert } from 'lucide-react'

import { ICON, NOTE, OVER } from './SprintCapacityNote.styles'

/**
 * The sprint's committed points against its capacity, for TicketBreakdown's `note` slot:
 * "38/40 pts de capacidad", or "45/40 pts · 5 sobre capacidad" once it goes past.
 *
 * `points` is what summarizeTickets counts (cancelled tickets out), the same figure the
 * collapsed row compares with the capacity. Past capacity it turns orange, gets the warning
 * icon and says by how much in words, so the colour is never the only signal.
 */
export function SprintCapacityNote({ points, capacity }) {
  const over = points - capacity

  if (over > 0) {
    return (
      <p className={OVER}>
        <TriangleAlert className={ICON} aria-hidden="true" />
        {points}/{capacity} pts · {over} sobre capacidad
      </p>
    )
  }

  return (
    <p className={NOTE}>
      {points}/{capacity} pts de capacidad
    </p>
  )
}
