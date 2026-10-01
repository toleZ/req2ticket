import { useId } from 'react'

import { typeBreakdown } from '@/components/epics/EpicBreakdown/EpicBreakdown.helpers'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { COUNT, HEADING, ITEM, LABEL, LIST, ROOT } from './EpicTypeProgress.styles'

/**
 * Done out of total for each ticket type in the epic, one short bar per type. Only the types
 * the epic has: an epic with no bugs shows no "Bugs 0/0" row.
 */
export function EpicTypeProgress({ tickets }) {
  const headingId = useId()
  const entries = typeBreakdown(tickets)

  // Every ticket cancelled: nothing to measure, and the summary above already says why.
  if (entries.length === 0) return null

  return (
    <section className={ROOT} aria-labelledby={headingId}>
      <h3 id={headingId} className={HEADING}>
        Por tipo
      </h3>
      <ul className={LIST}>
        {entries.map(({ type, stats }) => (
          <li key={type.value} className={ITEM}>
            <TicketTypeIcon type={type.value} className="size-3.5" />
            <span className={LABEL}>{type.plural}</span>
            <span className={COUNT}>
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
