/* Los cuatro tipos de ticket. Mismo formato { value, label, tone } que las listas de abajo,
   así findOption y <Badge> funcionan igual para los tres.

   `short` es lo que entra en el badge de una fila, donde no hay lugar para "Historia de
   usuario". */
export const TICKET_TYPE_OPTIONS = [
  { value: 'userStory', label: 'Historia de usuario', short: 'UH', tone: 'blue' },
  { value: 'task', label: 'Tarea', short: 'Tarea', tone: 'teal' },
  { value: 'bug', label: 'Bug', short: 'Bug', tone: 'red' },
  { value: 'fix', label: 'Fix', short: 'Fix', tone: 'green' },
]

/* Ticket priority uses its own scale — "Crítica" instead of "Urgente" — so it lives apart
   from epicOptions.js rather than reusing EPIC_PRIORITY_OPTIONS. */

export const TICKET_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'gray' },
  { value: 'medium', label: 'Media', tone: 'blue' },
  { value: 'high', label: 'Alta', tone: 'orange' },
  { value: 'critical', label: 'Crítica', tone: 'red' },
]

/* These strings are the API's contract — the .NET enums serialize exactly like this
   (see Ticket.cs). Never invent one: compare against the constant below, so a typo blows
   up as `undefined` instead of silently matching nothing. */
export const TICKET_DONE = 'done'

/* Terminal pero no exitoso. No cuenta como completado ni como pendiente: summarizeTickets
   lo saca del total, así que un ticket cancelado no arrastra para abajo el porcentaje de
   un sprint para siempre. */
export const TICKET_CANCELLED = 'cancelled'

/* Sentinel for the sprint filter's "Sin sprint" option. Not a sprint id and not a status:
   it is a case of its own, and it never sale de acá — el filtro compara contra sprintId,
   así que este string no viaja nunca a la API.

   Se llamaba 'backlog' y se renombró: ahora 'backlog' es un TicketStatus de verdad (y
   además ya era un EpicStatus). Tres cosas distintas con el mismo nombre es una de más. */
export const NO_SPRINT = '__sinSprint__'

/* En orden de flujo, y ese orden importa: la página de Tickets dibuja una sección por
   estado leyendo este array (no el enum de C#). Reordenar acá reordena la página. */
export const TICKET_STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', tone: 'neutral' },
  { value: 'todo', label: 'Por hacer', tone: 'gray' },
  { value: 'inProgress', label: 'En progreso', tone: 'blue' },
  { value: 'inReview', label: 'En revisión', tone: 'purple' },
  { value: 'testing', label: 'En pruebas', tone: 'orange' },
  { value: 'done', label: 'Hecho', tone: 'green' },
  { value: 'cancelled', label: 'Cancelado', tone: 'red' },
]
