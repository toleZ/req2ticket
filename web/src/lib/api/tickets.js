import { del, get, post, put } from './client'

export function getTickets() {
  return get('/api/tickets')
}

export function createTicket(values) {
  return post('/api/tickets', {
    type: values.type,
    title: values.title,
    description: values.description || null,
    epicId: Number(values.epicId),
    priority: values.priority,
    status: values.status,
    points: Number(values.points) || 0,
    assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
    sprintId: values.sprintId ? Number(values.sprintId) : null,
    parentId: values.parentId ? Number(values.parentId) : null,
    extraFields: values.extraFields || null,
  })
}

/* The backend's PUT replaces the whole ticket, so `patch` is merged over `ticket` (the one
   we already hold in memory) to avoid wiping the fields that did not change.

   `type` is absent on purpose: it is assigned once on create and the API refuses to change
   it, because the ticket's code carries its prefix. `extraFields` travels as the object the
   API returned, not as a string.

   `reporterId` is NOT optional here, and leaving it out was a real bug: TicketService.UpdateAsync
   does `ticket.ReporterId = changes.ReporterId` without checking, so a PUT that omits the key
   sends null and erases quien reportó el ticket. Nadie lo vio porque `reporterName` no se
   dibujaba en ninguna pantalla — el sidebar del modal de detalle lo muestra ("Abierta por …"),
   así que ahora se nota. La regla general: si la API reemplaza el recurso entero, acá tienen
   que viajar TODOS los campos, no solo los que la pantalla deja tocar. */
export async function updateTicket(ticket, patch) {
  const merged = { ...ticket, ...patch }
  await put(`/api/tickets/${ticket.id}`, {
    title: merged.title,
    description: merged.description || null,
    epicId: Number(merged.epicId),
    priority: merged.priority,
    status: merged.status,
    points: Number(merged.points) || 0,
    assigneeId: merged.assigneeId ? Number(merged.assigneeId) : null,
    reporterId: merged.reporterId ? Number(merged.reporterId) : null,
    sprintId: merged.sprintId ? Number(merged.sprintId) : null,
    parentId: merged.parentId ? Number(merged.parentId) : null,
    extraFields: merged.extraFields || null,
  })

  /* El PUT contesta 204 sin cuerpo, así que después de guardar se vuelve a pedir el ticket.
     Es un viaje más y vale la pena: la respuesta trae `epicName`, `sprintName`,
     `assigneeName` y `updatedAt` ya recalculados por el back. Armar todo eso a mano en la
     página era la misma lógica repetida en cada una de las tres — y `updatedAt` no hay forma
     de adivinarlo desde acá, que es justo lo que el modal de detalle muestra abajo. */
  return get(`/api/tickets/${ticket.id}`)
}

export function deleteTicket(id) {
  return del(`/api/tickets/${id}`)
}
