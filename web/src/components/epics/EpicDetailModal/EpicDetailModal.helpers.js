/* The form's values, read from the epic. The select keeps the owner as a string, like the
   inputs do; the API layer turns it back into a number. */
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

/* "Quedan 3 tickets abiertos" — why an epic cannot be closed yet (DEC-5). */
export function openTicketsReason(count) {
  return count === 1 ? 'Queda 1 ticket abierto' : `Quedan ${count} tickets abiertos`
}
