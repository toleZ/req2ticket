import { Badge } from '@/components/ui/Badge/Badge'
import { cn } from '@/lib/cn'
import { BODY, COLUMN, COLUMN_BLOCKED, COLUMN_OVER, EMPTY, HEADER, REASON } from './BoardColumn.styles'

/**
 * One column of the board: its status, how many cards it has, and the cards (children).
 *
 * Only the look: whether a card may land here is decided by BoardDnd, which tells this column
 * through `state`:
 *   'idle'     nothing is being dragged
 *   'open'     a card is being dragged and may land here
 *   'over'     …and it is over this column right now
 *   'blocked'  it may not land here: the column dims, and `reason` says why while hovering it
 */
export function BoardColumn({ status, count, state = 'idle', reason, children }) {
  return (
    <section
      aria-label={`${status.label}, ${count === 1 ? '1 ticket' : `${count} tickets`}`}
      className={cn(COLUMN, state === 'blocked' && COLUMN_BLOCKED, state === 'over' && COLUMN_OVER)}
    >
      <header className={HEADER}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span className="numeric text-caption text-label-secondary">{count}</span>
      </header>

      {state === 'blocked' && reason && (
        <p role="status" className={REASON}>
          {reason}
        </p>
      )}

      <div className={BODY}>{count === 0 ? <p className={EMPTY}>Soltá acá</p> : children}</div>
    </section>
  )
}
