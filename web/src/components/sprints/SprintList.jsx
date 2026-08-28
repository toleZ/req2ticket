import { SprintCard } from '@/components/sprints/SprintCard'

/**
 * The sprint list. Cards, not rows, so the gap is wider than the epic and ticket lists.
 *
 * `tickets` is every ticket in the project: each card gets its own already-filtered slice.
 * Tickets with no sprint are not shown here — they belong to SprintBacklog, further down
 * the page.
 */
export function SprintList({ sprints, tickets, onUpdateSprint, onDeleteSprint }) {
  return (
    <ul className="mt-4 flex flex-col gap-4">
      {sprints.map((sprint) => (
        <SprintCard
          key={sprint.id}
          sprint={sprint}
          tickets={tickets.filter((ticket) => ticket.sprintId === sprint.id)}
          onUpdateSprint={onUpdateSprint}
          onDeleteSprint={onDeleteSprint}
        />
      ))}
    </ul>
  )
}
