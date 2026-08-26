import { del, get, post, put } from './client'

export function getStories() {
  return get('/api/stories')
}

export function createStory(values) {
  return post('/api/stories', {
    title: values.title,
    description: values.description || null,
    epicId: Number(values.epicId),
    priority: values.priority,
    status: values.status,
    points: Number(values.points) || 0,
    assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
    sprintId: values.sprintId ? Number(values.sprintId) : null,
    criteriaTotal: Number(values.criteriaTotal) || 0,
  })
}

/* The backend's PUT replaces the whole story, so `patch` is merged over `story` (the one
   we already hold in memory) to avoid wiping the fields that did not change. */
export function updateStory(story, patch) {
  const merged = { ...story, ...patch }
  return put(`/api/stories/${story.id}`, {
    title: merged.title,
    description: merged.description || null,
    epicId: Number(merged.epicId),
    priority: merged.priority,
    status: merged.status,
    points: Number(merged.points) || 0,
    assigneeId: merged.assigneeId ? Number(merged.assigneeId) : null,
    sprintId: merged.sprintId ? Number(merged.sprintId) : null,
    criteriaTotal: Number(merged.criteriaTotal) || 0,
    criteriaDone: Number(merged.criteriaDone) || 0,
  })
}

export function deleteStory(id) {
  return del(`/api/stories/${id}`)
}
