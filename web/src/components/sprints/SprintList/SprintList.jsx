import { SprintRow } from '@/components/sprints/SprintRow/SprintRow'

/**
 * The sprint list, with the same rows and spacing as the epic list.
 *
 * `tickets` is every ticket in the project: each row gets its own already-filtered slice.
 * Tickets with no sprint are not shown here — they belong to SprintBacklog, further down
 * the page.
 */
export function SprintList({
  sprints,
  tickets,
  activeSprint,
  onSelectSprint,
  onUpdateSprint,
  onDeleteSprint,
  onSelectTicket,
}) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {sprints.map((sprint) => (
        <SprintRow
          key={sprint.id}
          sprint={sprint}
          tickets={tickets.filter((ticket) => ticket.sprintId === sprint.id)}
          activeSprint={activeSprint}
          onSelectSprint={onSelectSprint}
          onUpdateSprint={onUpdateSprint}
          onDeleteSprint={onDeleteSprint}
          onSelectTicket={onSelectTicket}
        />
      ))}
    </ul>
  )
}
