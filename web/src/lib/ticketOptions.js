/* The four ticket types. Same { value, label, tone } shape as the lists below, so findOption
   and <Badge> work the same way for all three.

   `short` is what fits in a row's badge, where there is no room for "Historia de usuario". */
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

/* Terminal but not successful. It counts as neither done nor pending: summarizeTickets takes
   it out of the total, so a cancelled ticket does not drag a sprint's percentage down
   forever. */
export const TICKET_CANCELLED = 'cancelled'

/* Sentinel for the sprint filter's "Sin sprint" option. Not a sprint id and not a status:
   it is a case of its own, and it never leaves this file — the filter compares against
   sprintId, so this string never travels to the API.

   It used to be called 'backlog' and was renamed: 'backlog' is now a real TicketStatus (and
   it already was an EpicStatus). Three different things under one name is one too many. */
export const NO_SPRINT = '__sinSprint__'

/* In flow order, and that order matters: the Tickets page draws one section per status by
   reading this array (not the C# enum). Reordering here reorders the page. */
export const TICKET_STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', tone: 'neutral' },
  { value: 'todo', label: 'Por hacer', tone: 'gray' },
  { value: 'inProgress', label: 'En progreso', tone: 'blue' },
  { value: 'inReview', label: 'En revisión', tone: 'purple' },
  { value: 'testing', label: 'En pruebas', tone: 'orange' },
  { value: 'done', label: 'Hecho', tone: 'green' },
  { value: 'cancelled', label: 'Cancelado', tone: 'red' },
]
