import { useId } from 'react'

import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import {
  ASIDE,
  ASIDE_COUNT,
  ASIDE_HEADING,
  ASIDE_ITEM,
  ASIDE_LABEL,
  ASIDE_LIST,
} from '@/components/tickets/TicketBreakdown/TicketBreakdown.styles'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { typeBreakdown } from './EpicTypeProgress.helpers'

/**
 * Done out of total for each ticket type in the epic, for TicketBreakdown's `aside`: one short
 * bar per type. Only the types the epic has: an epic with no bugs shows no "Bugs 0/0" row.
 *
 * The sprint's aside counts by person instead (SprintLoad); both share the aside's look from
 * TicketBreakdown.styles.
 */
export function EpicTypeProgress({ tickets }) {
  const headingId = useId()
  const entries = typeBreakdown(tickets)

  // Every ticket cancelled: nothing to measure, and the summary above already says why.
  if (entries.length === 0) return null

  return (
    <section className={ASIDE} aria-labelledby={headingId}>
      <h3 id={headingId} className={ASIDE_HEADING}>
        Por tipo
      </h3>
      <ul className={ASIDE_LIST}>
        {entries.map(({ type, stats }) => (
          <li key={type.value} className={ASIDE_ITEM}>
            <TicketTypeIcon type={type.value} className="size-3.5" />
            <span className={ASIDE_LABEL}>{type.plural}</span>
            <span className={ASIDE_COUNT}>
              {stats.completed}/{stats.total}
            </span>
            <ProgressBar
              value={stats.completed}
              max={stats.total}
              size="sm"
              tone="green"
              label={`${type.plural} en Hecho: ${stats.completed} de ${stats.total}`}
              className="col-start-2"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
