/* The form keeps every value as a string, like the inputs do: capacity goes back to a number
   when the sheet saves. */
export function toDetailValues(sprint) {
  return {
    name: sprint.name,
    goal: sprint.goal ?? '',
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    capacity: String(sprint.capacity),
    status: sprint.status,
  }
}

/* Where the focus goes when submit finds an error, keyed like validateSprintForm's result. */
export function fieldIds(sprintId) {
  return {
    name: `sprint-${sprintId}-name`,
    startDate: `sprint-${sprintId}-start`,
    endDate: `sprint-${sprintId}-end`,
    capacity: `sprint-${sprintId}-capacity`,
  }
}
