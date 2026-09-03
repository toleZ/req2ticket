import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList/TicketSummaryList'
import { Badge } from '@/components/ui/Badge/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { findOption } from '@/lib/options'
import { springSoft } from '@/lib/motion'
import { summarizeTickets } from '@/lib/ticketStats'

/* Named EXPAND_BUTTON and not TOGGLE_BUTTON: SprintCard has a constant by that name which is
   a full-width bordered text row, and this is a size-6 chevron button. Same name, nothing else
   in common. */
const EXPAND_BUTTON = `mt-0.5 grid size-6 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast ease-out-quad hover:bg-fill-secondary
  hover:text-label`

/* The clickable area is only the code and the name, not the whole row. Deliberately: the
   chevron sits next to it, and below, once expanded, is the ticket list, which are buttons
   too. If the click lived on the <li>, every one of those would need its own
   e.stopPropagation(), and forgetting one looks like "opening a ticket also opens the epic".

   The hover paints NO background. Painting it left a grey slab wrapping half the row —
   coloured badges included — and read as a patch, not as something clickable. What it
   announces is what a link announces: the name underlines and the code climbs a step of grey. */
const OPEN_BUTTON = 'group flex min-w-0 flex-wrap items-center gap-2 text-left'

const OPEN_CODE = `text-caption text-label-tertiary transition-colors duration-fast ease-out-quad
  group-hover:text-label-secondary`

/* `decoration-label-tertiary`: that line inherits the text colour unless told otherwise, and
   a black rule beneath a black name is far too heavy for a hover. */
const OPEN_NAME = `text-body font-medium text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

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
    <li className="rounded-control bg-fill-tertiary px-3 py-2.5">
      <div className="flex items-start gap-2">
        {/* The row is already bg-fill-tertiary, so EXPAND_BUTTON hovers to fill-secondary
            instead: the usual fill-tertiary hover would be invisible here. */}
        <button
          type="button"
          aria-label={isExpanded ? 'Ocultar tickets' : 'Ver tickets'}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          className={EXPAND_BUTTON}
        >
          <ChevronRight
            className={cn('size-4 transition-transform duration-fast ease-out-quad', isExpanded && 'rotate-90')}
            aria-hidden="true"
          />
        </button>

        {accent && (
          <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', accent.dotClass)} aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onSelectEpic(epic)}
            aria-label={`Abrir ${epic.code}: ${epic.name}`}
            className={OPEN_BUTTON}
          >
            <span className={OPEN_CODE}>{epic.code}</span>
            {/* An <h3> inside a <button> is valid HTML and keeps the page's heading outline,
                which is how a long list is navigated with a screen reader. */}
            <h3 className={OPEN_NAME}>{epic.name}</h3>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}
            {epic.ownerName && (
              <span className="text-footnote text-label-secondary">{epic.ownerName}</span>
            )}
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-caption text-label-tertiary">
              {stats.completed}/{stats.total} {stats.total === 1 ? 'ticket' : 'tickets'} ·{' '}
              {stats.pointsCompleted}/{stats.points} pts
            </span>
            <ProgressBar value={stats.completed} max={stats.total} size="sm" className="w-20" />
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
            <div className="ml-8 mt-3 border-t border-separator pt-3">
              <p className="text-footnote font-medium text-label-secondary">Tickets</p>
              {stats.total === 0 ? (
                <p className="mt-1.5 text-footnote text-label-tertiary">
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
