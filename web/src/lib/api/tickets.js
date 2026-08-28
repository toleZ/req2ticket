import { del, get, post, put } from './client'

export function getTickets() {
  return get('/api/tickets')
}

export function createTicket(values) {
  return post('/api/tickets', {
    type: values.type,
    title: values.title,
    description: values.description || null,
    epicId: Number(values.epicId),
    priority: values.priority,
    status: values.status,
    points: Number(values.points) || 0,
    assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
    sprintId: values.sprintId ? Number(values.sprintId) : null,
    parentId: values.parentId ? Number(values.parentId) : null,
    extraFields: values.extraFields || null,
  })
}

/* The backend's PUT replaces the whole ticket, so `patch` is merged over `ticket` (the one
   we already hold in memory) to avoid wiping the fields that did not change.

   `type` is absent on purpose: it is assigned once on create and the API refuses to change
   it, because the ticket's code carries its prefix. `extraFields` travels as the object the
   API returned, not as a string. */
export function updateTicket(ticket, patch) {
  const merged = { ...ticket, ...patch }
  return put(`/api/tickets/${ticket.id}`, {
    title: merged.title,
    description: merged.description || null,
    epicId: Number(merged.epicId),
    priority: merged.priority,
    status: merged.status,
    points: Number(merged.points) || 0,
    assigneeId: merged.assigneeId ? Number(merged.assigneeId) : null,
    sprintId: merged.sprintId ? Number(merged.sprintId) : null,
    parentId: merged.parentId ? Number(merged.parentId) : null,
    extraFields: merged.extraFields || null,
  })
}

export function deleteTicket(id) {
  return del(`/api/tickets/${id}`)
}
