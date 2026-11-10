import { useState } from 'react'

import { TicketRow } from '@/components/tickets/TicketRow/TicketRow'
import { FoldHeader } from '@/components/ui/FoldHeader/FoldHeader'
import { LoadMore } from '@/components/ui/LoadMore/LoadMore'
import { PAGE } from '@/components/ui/LoadMore/LoadMore.data'
import { readUiPref, writeUiPref } from '@/lib/uiPrefs'
import { FOLDED_BY_DEFAULT } from './TicketList.data'

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
      <FoldHeader title={status.label} count={tickets.length} folded={folded} onToggle={toggle} />

      {!folded && (
        <div>
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
