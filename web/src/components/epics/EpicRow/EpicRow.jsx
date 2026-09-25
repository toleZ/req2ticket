import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList/TicketSummaryList'
import { Badge } from '@/components/ui/Badge/Badge'
import { CHEVRON, EXPAND_BUTTON, META, PANEL, PANEL_LABEL, ROW } from '@/components/ui/ListRow/ListRow.styles'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { findOption } from '@/lib/options'
import { springSoft } from '@/lib/motion'
import { cancelledNote, summarizeTickets } from '@/lib/ticketStats'
import { OPEN_BUTTON, OPEN_CODE, OPEN_NAME, OWNER_NAME } from './EpicRow.styles'

/**
 * An epic in the list: read-only, apart from the disclosure that shows its tickets.
 *
 * The status and the priority used to be edited in here with two selects; that now lives in
 * EpicDetailModal, which also lets you touch the name, description, owner and colour.
 */
export function EpicRow({ epic, tickets, onSelectEpic, onSelectTicket }) {
  const panelId = useId()
  const [isExpanded, setIsExpanded] = useState(false)

  const accent = findOption(ACCENT_COLORS, epic.accentColor)
  const status = findOption(EPIC_STATUS_OPTIONS, epic.status)
  const priority = findOption(EPIC_PRIORITY_OPTIONS, epic.priority)
  const stats = summarizeTickets(tickets)

  return (
    <li className={ROW}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={isExpanded ? `Ocultar tickets de ${epic.name}` : `Ver tickets de ${epic.name}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          className={EXPAND_BUTTON}
        >
          <ChevronRight
            className={cn(CHEVRON, isExpanded && 'rotate-90')}
            aria-hidden="true"
          />
        </button>

        {accent && (
          <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', accent.dotClass)} aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          {/* The heading wraps the button, not the other way round: a <button> may only hold
              phrasing content, and whatever is inside it is presentational to a screen reader,
              so a heading in there never reached the page outline. Wrapped like this each epic
              is an <h2> named by its button, which is how a long list is navigated. */}
          <h2 className="min-w-0">
            <button
              type="button"
              onClick={() => onSelectEpic(epic)}
              aria-label={[
                `Abrir ${epic.code}: ${epic.name}`,
                status?.label,
                priority && `prioridad ${priority.label}`,
                epic.ownerName,
              ]
                .filter(Boolean)
                .join(' · ')}
              className={OPEN_BUTTON}
            >
              <span className={OPEN_CODE}>{epic.code}</span>
              <span className={OPEN_NAME}>{epic.name}</span>
              {status && <Badge tone={status.tone}>{status.label}</Badge>}
              {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}
              {epic.ownerName && (
                <span className={OWNER_NAME}>{epic.ownerName}</span>
              )}
            </button>
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={META}>
              {stats.completed}/{stats.total} {stats.total === 1 ? 'ticket' : 'tickets'}
              {cancelledNote(stats)} ·{' '}
              {stats.pointsCompleted}/{stats.points} pts
            </span>
            <ProgressBar
              value={stats.completed}
              max={stats.total}
              size="sm"
              label={`Tickets completados: ${stats.completed} de ${stats.total}`}
              className="w-20"
            />
          </div>

          {epic.description && (
            <p className="mt-1 text-footnote text-label-secondary">{epic.description}</p>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSoft}
            className="overflow-hidden"
          >
            <div className={PANEL}>
              <p className={PANEL_LABEL}>Tickets</p>
              {stats.all === 0 ? (
                <p className="mt-1.5 text-footnote text-label-secondary">
                  Esta épica todavía no tiene tickets.
                </p>
              ) : (
                <div className="mt-1.5">
                  <TicketSummaryList tickets={tickets} onSelectTicket={onSelectTicket} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
