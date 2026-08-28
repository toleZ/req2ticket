import { CHECKLIST_KEY } from '@/lib/ticketExtraFields'
import { TICKET_CANCELLED, TICKET_DONE } from '@/lib/ticketOptions'

/* Summary of a set of tickets. The sprint card and the epic row share it: both show the
   same numbers over different slices of the backlog. */

export function summarizeTickets(tickets) {
  /* Los cancelados salen de la cuenta antes que nada: no son ni completados ni pendientes.
     Si contaran en `total`, un sprint con trabajo descartado nunca llegaría al 100%. Siguen
     visibles en la lista de Tickets, en su propia sección — lo que no hacen es sumar acá. */
  const counted = tickets.filter((ticket) => ticket.status !== TICKET_CANCELLED)
  const done = counted.filter((ticket) => ticket.status === TICKET_DONE)

  return {
    total: counted.length,
    completed: done.length,
    points: counted.reduce((sum, ticket) => sum + ticket.points, 0),
    pointsCompleted: done.reduce((sum, ticket) => sum + ticket.points, 0),
  }
}

/* Cuántos ítems del checklist del ticket están tildados, y cuántos hay.

   Qué lista cuenta depende del tipo (CHECKLIST_KEY): los criterios de aceptación de una
   historia, el checklist de una tarea, los pasos de verificación de un fix. El bug no tiene,
   y devuelve 0 de 0 — la fila usa eso para no dibujar la barra. */
export function checklistProgress(ticket) {
  const key = CHECKLIST_KEY[ticket.type]
  const items = key && ticket.extraFields ? ticket.extraFields[key] : null

  if (!items) return { total: 0, done: 0 }

  return { total: items.length, done: items.filter((item) => item.done).length }
}
