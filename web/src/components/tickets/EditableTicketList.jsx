import { EditableTicketRow } from '@/components/tickets/EditableTicketRow'

const COUNT_PILL = `rounded-control bg-fill-tertiary px-1.5 py-0.5 text-caption2 font-medium
  text-label-secondary`

/**
 * The ticket list, grouped into one block per status.
 *
 * `sections` is an array of `{ status, tickets }`, which is what the Tickets page builds
 * just above the place it renders this:
 *
 *     [{ status: { value: 'todo', label: 'Por hacer', … }, tickets: [...] }, …]
 *
 * Deciding *which* groups exist, in what order, and whether the rows inside are sorted is
 * the page's job — it owns the filters and the sort toggle. This file only decides what a
 * group looks like.
 *
 * A group with no tickets still renders: it keeps its header and its count, and says so.
 * That is on purpose, so the columns do not jump around as you type in the filter.
 */
export function EditableTicketList({ sections, sprints, onUpdateTicket, onDeleteTicket }) {
  return (
    <div className="mt-4 flex flex-col gap-6">
      {sections.map(({ status, tickets }) => (
        <div key={status.value}>
          <div className="flex items-center gap-2">
            <h2 className="text-subheadline font-medium text-label">{status.label}</h2>
            <span className={COUNT_PILL}>{tickets.length}</span>
          </div>

          {tickets.length === 0 ? (
            <p className="mt-2 text-footnote text-label-tertiary">Sin tickets en este estado.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {tickets.map((ticket) => (
                <EditableTicketRow
                  key={ticket.id}
                  ticket={ticket}
                  sprints={sprints}
                  onUpdateTicket={onUpdateTicket}
                  onDeleteTicket={onDeleteTicket}
                />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
