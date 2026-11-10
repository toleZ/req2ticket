import { del, get, post, put } from './client'

/* [{ id, name, goal, startDate, endDate, capacity, status, ticketCount, openTicketCount,
   committedPoints }]. A sprint is born planned; its status only moves through start and
   complete, never through the PUT. */
export function getSprints(projectId) {
  return get(`/api/projects/${projectId}/sprints`)
}

function toPayload(values) {
  return {
    name: values.name.trim(),
    goal: values.goal || null,
    startDate: values.startDate,
    endDate: values.endDate,
    capacity: Number(values.capacity) || 0,
  }
}

export function createSprint(projectId, values) {
  return post(`/api/projects/${projectId}/sprints`, toPayload(values))
}

/* The PUT replaces the sprint's data, so `patch` is merged over `sprint`. */
export function updateSprint(projectId, sprint, patch) {
  return put(`/api/projects/${projectId}/sprints/${sprint.id}`, toPayload({ ...sprint, ...patch }))
}

/* Starting confirms the dates: { startDate, endDate } as 'YYYY-MM-DD'. The API refuses an empty
   sprint, and an end date in the past. */
export function startSprint(projectId, sprintId, { startDate, endDate }) {
  return post(`/api/projects/${projectId}/sprints/${sprintId}/start`, { startDate, endDate })
}

/* `moveOpenTicketsTo`: a planned sprint's id, or null for the backlog. Answers
   { sprint, movedTickets }. */
export function completeSprint(projectId, sprintId, moveOpenTicketsTo) {
  return post(`/api/projects/${projectId}/sprints/${sprintId}/complete`, {
    moveOpenTicketsTo: moveOpenTicketsTo ? Number(moveOpenTicketsTo) : null,
  })
}

/* Only planned sprints; their tickets go back to the backlog. */
export function deleteSprint(projectId, sprintId) {
  return del(`/api/projects/${projectId}/sprints/${sprintId}`)
}
