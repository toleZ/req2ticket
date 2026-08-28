import { Search } from 'lucide-react'

import { NO_SPRINT, TICKET_PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'

/* The filters are chips, smaller than a form field. */
const FILTER_SELECT = `w-auto rounded-control border border-separator bg-fill-tertiary px-2.5
  py-1.5 text-footnote text-label disabled:opacity-50`

const SEARCH_BOX = `flex min-w-48 flex-1 items-center gap-2 rounded-control border
  border-separator bg-fill-tertiary px-2.5 py-1.5`

const SEARCH_INPUT = `w-full bg-transparent text-footnote text-label
  placeholder:text-label-tertiary focus:outline-none`

/**
 * The search box and the five filter chips above the ticket list.
 *
 * There are a lot of props, but they are all the same two: the current value, and the
 * function that sets it. Each pair is named after the page's state — `epicFilter` /
 * `onEpicFilterChange` — so the call site reads as a column of matching names.
 *
 * The handlers receive the **value**, not the event: this component does the
 * `e.target.value` itself. That is why the page can pass its useState setters straight in,
 * without writing a single arrow function:
 *
 *     <TicketFilterBar epicFilter={epicFilter} onEpicFilterChange={setEpicFilter} … />
 *
 * The five selects are deliberately written out one after the other instead of being one
 * component used five times. They are not the same: the sprint one has an extra "Sin
 * sprint" option, and the type and priority ones read `{value, label}` while the other three
 * read `{id, name}`. Side by side, those differences are visible; behind props they would not
 * be.
 */
export function TicketFilterBar({
  users,
  epics,
  sprints,
  search,
  onSearchChange,
  assigneeFilter,
  onAssigneeFilterChange,
  epicFilter,
  onEpicFilterChange,
  sprintFilter,
  onSprintFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  typeFilter,
  onTypeFilterChange,
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className={SEARCH_BOX}>
        <Search className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filtrar tickets"
          aria-label="Filtrar tickets"
          className={SEARCH_INPUT}
        />
      </div>

      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        aria-label="Tipo"
        className={FILTER_SELECT}
      >
        <option value="">Tipo</option>
        {TICKET_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={assigneeFilter}
        onChange={(e) => onAssigneeFilterChange(e.target.value)}
        aria-label="Asignado"
        className={FILTER_SELECT}
      >
        <option value="">Asignado</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <select
        value={epicFilter}
        onChange={(e) => onEpicFilterChange(e.target.value)}
        aria-label="Épica"
        className={FILTER_SELECT}
      >
        <option value="">Épica</option>
        {epics.map((epic) => (
          <option key={epic.id} value={epic.id}>
            {epic.name}
          </option>
        ))}
      </select>

      <select
        value={sprintFilter}
        onChange={(e) => onSprintFilterChange(e.target.value)}
        aria-label="Sprint"
        className={FILTER_SELECT}
      >
        <option value="">Sprint</option>
        <option value={NO_SPRINT}>Sin sprint</option>
        {sprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.name}
          </option>
        ))}
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => onPriorityFilterChange(e.target.value)}
        aria-label="Prioridad"
        className={FILTER_SELECT}
      >
        <option value="">Prioridad</option>
        {TICKET_PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
