import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { COUNT_PILL } from './TicketList.styles'
import { TicketRow } from '@/components/tickets/TicketRow/TicketRow'
import { LoadMore, PAGE } from '@/components/ui/LoadMore/LoadMore'
import { cn } from '@/lib/cn'
import { readUiPref, writeUiPref } from '@/lib/uiPrefs'

/* Finished work is most of a real backlog and rarely what you came for: those sections start
   folded. Whatever you fold or unfold afterwards is remembered, per status. */
const FOLDED_BY_DEFAULT = ['done', 'cancelled']

/**
 * The ticket list, grouped into one block per status.
 *
 * `sections` is an array of `{ status, tickets }` that the page builds (it owns the filters and
 * the order). This file only decides what a group looks like: a header that folds it, the
 * first PAGE rows, and a button that adds PAGE more — never an endless column that buries the
 * sections below it. The page remounts this list when the filters change, so every section
 * starts again from its first page.
 */
export function TicketList({ sections, epics, onSelectTicket }) {
  return (
    <div className="mt-4 flex flex-col gap-6">
      {sections.map(({ status, tickets }) => (
        <TicketSection
          key={status.value}
          status={status}
          tickets={tickets}
          epics={epics}
          onSelectTicket={onSelectTicket}
        />
      ))}
    </div>
  )
}

function TicketSection({ status, tickets, epics, onSelectTicket }) {
  const prefKey = `backlog.folded.${status.value}`
  const [folded, setFolded] = useState(() => readUiPref(prefKey, FOLDED_BY_DEFAULT.includes(status.value)))
  const [limit, setLimit] = useState(PAGE)
  /* Where the rows just revealed start (see lib/reveal.js): the old limit after "Mostrar
     más", 0 after unfolding, null on first render so the page does not animate on load. */
  const [revealFrom, setRevealFrom] = useState(null)

  const visible = tickets.slice(0, limit)
  const listId = `backlog-section-${status.value}`

  function toggle() {
    if (folded) setRevealFrom(0)
    setFolded(!folded)
    writeUiPref(prefKey, !folded)
  }

  function showMore(nextLimit) {
    setRevealFrom(limit)
    setLimit(nextLimit)
  }

  return (
    <div>
      {/* The heading wraps the button (not the other way round) so the section stays in the
          page's heading outline while the whole header folds it. */}
      <h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!folded}
          aria-controls={listId}
          className="group flex min-h-11 items-center gap-2 rounded-control text-left lg:min-h-7"
        >
          <ChevronRight
            className={cn(
              'size-4 shrink-0 text-label-secondary transition-[rotate] duration-fast ease-out-quad',
              !folded && 'rotate-90',
            )}
            aria-hidden="true"
          />
          <span className="text-subheadline font-medium text-label group-hover:underline group-hover:decoration-label-tertiary group-hover:underline-offset-2">
            {status.label}
          </span>
          <span className={COUNT_PILL}>{tickets.length}</span>
        </button>
      </h2>

      {!folded && (
        <div id={listId}>
          {tickets.length === 0 ? (
            <p className="mt-2 pl-6 text-footnote text-label-secondary">Sin tickets en este estado.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {visible.map((ticket, index) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  epics={epics}
                  index={index}
                  revealFrom={revealFrom}
                  onSelectTicket={onSelectTicket}
                />
              ))}
            </ul>
          )}

          <LoadMore
            shown={visible.length}
            total={tickets.length}
            onMore={() => showMore(limit + PAGE)}
            onAll={() => showMore(tickets.length)}
          />
        </div>
      )}
    </div>
  )
}
