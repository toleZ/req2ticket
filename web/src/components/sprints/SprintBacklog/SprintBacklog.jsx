import { useState } from 'react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList/TicketSummaryList'
import { Badge } from '@/components/ui/Badge/Badge'
import { LoadMore, PAGE } from '@/components/ui/LoadMore/LoadMore'

/**
 * The Backlog block at the foot of the Sprints page: the tickets nobody has put in a
 * sprint yet.
 *
 * Each row opens that ticket's detail modal, which is where its sprint gets set — the copy
 * below used to send you to the Tickets page for that, and no longer needs to.
 *
 * The heading and the count stay visible even with nothing in the backlog, so an empty
 * backlog reads as "none left" rather than as a section that failed to load. A long backlog
 * shows a page at a time (LoadMore) instead of pushing the page down forever.
 */
export function SprintBacklog({ tickets, onSelectTicket }) {
  const [limit, setLimit] = useState(PAGE)
  const [revealFrom, setRevealFrom] = useState(null)
  const visible = tickets.slice(0, limit)

  function showMore(nextLimit) {
    setRevealFrom(limit)
    setLimit(nextLimit)
  }

  return (
    <div className="mt-6 border-t border-separator pt-4">
      <div className="flex items-center gap-2">
        <h2 className="text-headline text-label">Backlog</h2>
        <Badge tone="neutral">{tickets.length}</Badge>
      </div>
      <p className="mt-1 max-w-prose text-footnote text-label-secondary">
        Tickets sin sprint asignado. Hacé clic en uno para asignarle un sprint.
      </p>

      {tickets.length > 0 && (
        <div className="mt-3">
          <TicketSummaryList tickets={visible} revealFrom={revealFrom} onSelectTicket={onSelectTicket} />
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
