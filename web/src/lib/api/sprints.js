import { del, get, post, put } from './client'

export function getSprints() {
  return get('/api/sprints')
}

export function createSprint(values) {
  return post('/api/sprints', {
    name: values.name,
    goal: values.goal || null,
    startDate: values.startDate,
    endDate: values.endDate,
    capacity: Number(values.capacity),
    status: values.status,
  })
}

/* The backend's PUT replaces the whole sprint, so `patch` is merged over `sprint` (the one
   we already hold in memory) to avoid wiping the fields that did not change. */
export function updateSprint(sprint, patch) {
  const merged = { ...sprint, ...patch }
  return put(`/api/sprints/${sprint.id}`, {
    name: merged.name,
    goal: merged.goal || null,
    startDate: merged.startDate,
    endDate: merged.endDate,
    capacity: Number(merged.capacity),
    status: merged.status,
  })
}

export function deleteSprint(id) {
  return del(`/api/sprints/${id}`)
}
