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
   API returned, not as a string.

   `reporterId` is NOT optional here, and leaving it out was a real bug: TicketService.UpdateAsync
   does `ticket.ReporterId = changes.ReporterId` without checking, so a PUT that omits the key
   sends null and erases who reported the ticket. Nobody noticed because `reporterName` was not
   drawn on any screen — the detail modal's sidebar does show it ("Abierta por …"), so now it
   is visible. The general rule: if the API replaces the whole resource, EVERY field has to
   travel from here, not only the ones the screen lets you touch. */
export async function updateTicket(ticket, patch) {
  const merged = { ...ticket, ...patch }
  await put(`/api/tickets/${ticket.id}`, {
    title: merged.title,
    description: merged.description || null,
    epicId: Number(merged.epicId),
    priority: merged.priority,
    status: merged.status,
    points: Number(merged.points) || 0,
    assigneeId: merged.assigneeId ? Number(merged.assigneeId) : null,
    reporterId: merged.reporterId ? Number(merged.reporterId) : null,
    sprintId: merged.sprintId ? Number(merged.sprintId) : null,
    parentId: merged.parentId ? Number(merged.parentId) : null,
    extraFields: merged.extraFields || null,
  })

  /* The PUT answers 204 with no body, so the ticket is requested again after saving. It is
     one more round trip and it is worth it: the response carries `epicName`, `sprintName`,
     `assigneeName` and `updatedAt` already recalculated by the backend. Building all that by
     hand in the page was the same logic repeated in each of the three — and `updatedAt` cannot
     be guessed from here, which is exactly what the detail modal shows at the bottom. */
  return get(`/api/tickets/${ticket.id}`)
}

export function deleteTicket(id) {
  return del(`/api/tickets/${id}`)
}
