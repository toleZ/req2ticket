/* The colour system, in one place. A colour means one thing across the app, and repeats
   only where the meaning is the same:

   - Where work is in its flow (ticket, epic and sprint status alike): not started is grey,
     in progress blue, in review indigo, in testing purple, done green. Cancelled is grey and
     struck through — it ended, but not well, and it is not an alarm.
   - How urgent it is (ticket and epic priority): the warm colours only — none for Baja,
     then yellow, orange and red. Red is otherwise kept for errors and destructive actions.
   - What kind of ticket it is: not a colour at all. The type is the icon's shape (book,
     list, bug, wrench), drawn in grey, so it no longer competes with status and priority.

   The four ticket types. `short` is what fits where there is no room for "Historia de
   usuario". */
export const TICKET_TYPE_OPTIONS = [
  { value: 'userStory', label: 'Historia de usuario', short: 'UH' },
  { value: 'task', label: 'Tarea', short: 'Tarea' },
  { value: 'bug', label: 'Bug', short: 'Bug' },
  { value: 'fix', label: 'Fix', short: 'Fix' },
]

/* Ticket priority uses its own scale — "Crítica" instead of "Urgente" — so it lives apart
   from epicOptions.js rather than reusing EPIC_PRIORITY_OPTIONS. */

export const TICKET_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'neutral' },
  { value: 'medium', label: 'Media', tone: 'yellow' },
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

/* In flow order, and that order matters: the Tickets page draws one section per status by
   reading this array (not the C# enum). Reordering here reorders the page. */
export const TICKET_STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', tone: 'neutral' },
  { value: 'todo', label: 'Por hacer', tone: 'gray' },
  { value: 'inProgress', label: 'En progreso', tone: 'blue' },
  { value: 'inReview', label: 'En revisión', tone: 'indigo' },
  { value: 'testing', label: 'En pruebas', tone: 'purple' },
  { value: 'done', label: 'Hecho', tone: 'green' },
  { value: 'cancelled', label: 'Cancelado', tone: 'struck' },
]
