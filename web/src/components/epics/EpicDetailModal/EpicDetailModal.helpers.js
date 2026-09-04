export function toDetailValues(epic) {
  return {
    name: epic.name,
    description: epic.description ?? '',
    accentColor: epic.accentColor ?? 'blue',
    priority: epic.priority,
    status: epic.status,
    ownerId: epic.ownerId ? String(epic.ownerId) : '',
  }
}
