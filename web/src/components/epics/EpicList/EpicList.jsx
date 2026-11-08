import { EpicRow } from '@/components/epics/EpicRow/EpicRow'

/**
 * The epic list.
 *
 * `tickets` is every ticket in the project, not one epic's worth: there is one list per project
 * and each row gets its own already-filtered slice. `members` names the owners, and
 * `backlogPath` is the project's Backlog, which each row filters to its epic.
 */
export function EpicList({ epics, tickets, members, backlogPath, onSelectEpic, onSelectTicket }) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {epics.map((epic) => (
        <EpicRow
          key={epic.id}
          epic={epic}
          ownerName={members.find((member) => member.id === epic.ownerId)?.name}
          tickets={tickets.filter((ticket) => ticket.epicId === epic.id)}
          backlogHref={`${backlogPath}?epic=${epic.id}`}
          onSelectEpic={onSelectEpic}
          onSelectTicket={onSelectTicket}
        />
      ))}
    </ul>
  )
}
