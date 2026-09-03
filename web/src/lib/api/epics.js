import { del, get, post, put } from './client'

export function getEpics() {
  return get('/api/epics')
}

export function createEpic(values) {
  return post('/api/epics', {
    name: values.name,
    description: values.description || null,
    accentColor: values.accentColor,
    priority: values.priority,
    status: values.status,
    ownerId: values.ownerId ? Number(values.ownerId) : null,
  })
}

/* The backend's PUT replaces the whole epic, so `patch` is merged over `epic` (the one we
   already hold in memory) to avoid wiping the fields that did not change. */
export function updateEpic(epic, patch) {
  const merged = { ...epic, ...patch }
  return put(`/api/epics/${epic.id}`, {
    name: merged.name,
    description: merged.description || null,
    accentColor: merged.accentColor,
    priority: merged.priority,
    status: merged.status,
    ownerId: merged.ownerId ? Number(merged.ownerId) : null,
  })
}

export function deleteEpic(id) {
  return del(`/api/epics/${id}`)
}
