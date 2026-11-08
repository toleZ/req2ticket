import { del, get, put } from './client'

/* { transitions: [{ from, to }], updatedAt }, or null when the project moves freely. */
export function getWorkflow(projectId) {
  return get(`/api/projects/${projectId}/workflow`)
}

/* Creates the workflow or replaces it whole: `transitions` is the complete list. */
export function saveWorkflow(projectId, transitions) {
  return put(`/api/projects/${projectId}/workflow`, { transitions })
}

export function deleteWorkflow(projectId) {
  return del(`/api/projects/${projectId}/workflow`)
}
