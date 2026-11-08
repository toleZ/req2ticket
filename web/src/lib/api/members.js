import { del, get, post, put } from './client'

/* The team of a project: [{ userId, name, email, role, assignedTickets, ownedEpics }]. The two
   counts are this project's only — what removing someone would leave unassigned. */
export function getMembers(projectId) {
  return get(`/api/projects/${projectId}/members`)
}

/* The person has to be registered already. */
export function addMember(projectId, { email, role }) {
  return post(`/api/projects/${projectId}/members`, { email: email.trim(), role })
}

export function changeMemberRole(projectId, userId, role) {
  return put(`/api/projects/${projectId}/members/${userId}`, { role })
}

export function removeMember(projectId, userId) {
  return del(`/api/projects/${projectId}/members/${userId}`)
}
