import { typeFieldsToPayload } from '@/lib/ticketTypes'
import { del, get, patch, post, put } from './client'

/* The list is light (TicketSummary): no description and no lists, but with points,
   checklistDone/checklistTotal and openChildrenCount. The detail brings everything: the
   description, the type's object (ticket.bug, ticket.userStory…), the children, and the names
   of the epic, the people and the sprint. */
export function getTickets(projectId) {
  return get(`/api/projects/${projectId}/tickets`)
}

export function getTicket(projectId, ticketId) {
  return get(`/api/projects/${projectId}/tickets/${ticketId}`)
}

/* R2T-UH-12, or uh-12: the API normalizes the case. */
export function getTicketByCode(projectId, code) {
  return get(`/api/projects/${projectId}/tickets/code/${encodeURIComponent(code.trim())}`)
}

/* `values` is a form: the common fields, `points`, and `typeFields` with the type's own ones
   (see lib/ticketTypes.js). Only the type's object travels — the API refuses any other.
   No status and no reporter: a ticket is born "todo" and its reporter is whoever is logged in. */
function toPayload(values) {
  return {
    type: values.type,
    title: values.title.trim(),
    description: values.description || null,
    epicId: Number(values.epicId),
    priority: values.priority,
    assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
    sprintId: values.sprintId ? Number(values.sprintId) : null,
    parentId: values.parentId ? Number(values.parentId) : null,
    [values.type]: typeFieldsToPayload(values.type, values.typeFields ?? {}, values.points),
  }
}

/* Answers the ticket's detail, as saved. */
export function createTicket(projectId, values) {
  return post(`/api/projects/${projectId}/tickets`, toPayload(values))
}

/* The PUT replaces everything the ticket owns, so `ticketValues` has to be COMPLETE: build it
   from the detail (ticketToFormValues in lib/ticketTypes.js), never from the list's
   summary, which has no description and no lists. Status is not part of it — use
   changeTicketStatus. Answers the detail as saved. */
export function updateTicket(projectId, ticketId, ticketValues) {
  return put(`/api/projects/${projectId}/tickets/${ticketId}`, toPayload(ticketValues))
}

/* The one way to change status: the detail's selector and the board both use it. The API
   checks the workflow, the children and the epic, and answers 400 with the reason. */
export function changeTicketStatus(projectId, ticketId, status) {
  return patch(`/api/projects/${projectId}/tickets/${ticketId}/status`, { status })
}

/* Takes every descendant with it. */
export function deleteTicket(projectId, ticketId) {
  return del(`/api/projects/${projectId}/tickets/${ticketId}`)
}
