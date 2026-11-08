import { del, get, post, put } from './client'

/* The list is light (EpicSummary: no description, with ticketCount, openTicketsCount and
   doneTicketsCount); the detail adds description and ownerName. */
export function getEpics(projectId) {
  return get(`/api/projects/${projectId}/epics`)
}

export function getEpic(projectId, epicId) {
  return get(`/api/projects/${projectId}/epics/${epicId}`)
}

function toPayload(values) {
  return {
    name: values.name.trim(),
    description: values.description || null,
    accentColor: values.accentColor || null,
    priority: values.priority,
    status: values.status,
    ownerId: values.ownerId ? Number(values.ownerId) : null,
  }
}

/* Answers the epic's detail, as saved. */
export function createEpic(projectId, values) {
  return post(`/api/projects/${projectId}/epics`, toPayload(values))
}

/* The PUT replaces the whole epic, so `patch` is merged over `epic`. Pass the DETAIL, not the
   list's summary: the summary has no description, and merging over it would erase it.
   Answers the detail as saved. */
export function updateEpic(projectId, epic, patch) {
  return put(`/api/projects/${projectId}/epics/${epic.id}`, toPayload({ ...epic, ...patch }))
}

export function deleteEpic(projectId, epicId) {
  return del(`/api/projects/${projectId}/epics/${epicId}`)
}
