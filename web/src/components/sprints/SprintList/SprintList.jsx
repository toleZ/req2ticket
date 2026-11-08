import { SprintRow } from '@/components/sprints/SprintRow/SprintRow'

/**
 * The sprint list, with the same rows and spacing as the epic list.
 *
 * `tickets` is every ticket in the project: each row gets its own already-filtered slice.
 * Tickets with no sprint are not shown here — they belong to SprintBacklog, further down
 * the page. The rest goes to every row as it is (see SprintRow).
 */
export function SprintList({
  sprints,
  tickets,
  activeSprint,
  canManage,
  backlogPath,
  onSelectSprint,
  onStartSprint,
  onCompleteSprint,
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
          canManage={canManage}
          backlogPath={backlogPath}
          onSelectSprint={onSelectSprint}
          onStartSprint={onStartSprint}
          onCompleteSprint={onCompleteSprint}
          onDeleteSprint={onDeleteSprint}
          onSelectTicket={onSelectTicket}
        />
      ))}
    </ul>
  )
}
