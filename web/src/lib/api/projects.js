import { del, get, post, put } from './client'

/* My projects: [{ id, key, name, description, isArchived, myRole }]. */
export function getProjects({ includeArchived = false } = {}) {
  return get(`/api/projects${includeArchived ? '?includeArchived=true' : ''}`)
}

/* One project with what I may do in it: { …, myRole, isSuperAdmin, myPermissions }. */
export function getProject(projectId) {
  return get(`/api/projects/${projectId}`)
}

/* The key is upper-cased by the API and can never change afterwards. */
export function createProject({ key, name, description }) {
  return post('/api/projects', {
    key: key.trim(),
    name: name.trim(),
    description: description?.trim() || null,
  })
}

export function updateProject(projectId, { name, description }) {
  return put(`/api/projects/${projectId}`, {
    name: name.trim(),
    description: description?.trim() || null,
  })
}

export function archiveProject(projectId) {
  return post(`/api/projects/${projectId}/archive`)
}

export function unarchiveProject(projectId) {
  return post(`/api/projects/${projectId}/unarchive`)
}

/* SuperAdmin only, and for good: everything in the project goes with it. */
export function deleteProject(projectId) {
  return del(`/api/projects/${projectId}`)
}
