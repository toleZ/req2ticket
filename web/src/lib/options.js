/* Every option list in the app, and the labels the API's values get on screen. Shared between
   the forms (as <select> options and swatches) and the lists (as badges), so a label and its
   colour never drift apart.

   The colour system, in one place. A colour means one thing across the app, and repeats
   only where the meaning is the same:

   - Where work is in its flow (ticket, epic and sprint status alike): not started is grey,
     in progress blue, in review indigo, in testing purple, done green. Cancelled is grey and
     struck through — it ended, but not well, and it is not an alarm.
   - How urgent it is (ticket and epic priority): the warm colours only — none for Baja,
     then yellow, orange and red. Red is otherwise kept for errors and destructive actions.
   - What kind of ticket it is: not a colour at all. The type is the icon's shape (book,
     list, bug, wrench), drawn in grey, so it no longer competes with status and priority.

   The TICKET_ / EPIC_ / SPRINT_ prefixes are not decoration: each entity has its own scale
   with different values (an epic uses `urgent`, a ticket uses `critical`), and without the
   prefix autocomplete hands you the wrong one without anything failing.

   The status strings are the API's contract — the .NET enums serialize exactly like this
   (see Ticket.cs, Sprint.cs). Never invent one: compare against the constants below, so a
   typo blows up as `undefined` instead of silently matching nothing. */

export function findOption(options, value) {
  return options.find((option) => option.value === value)
}

/* Where a value sits in its list. The priority lists run low to high, so a higher rank is
   more urgent. */
export function rankOf(options, value) {
  return options.findIndex((option) => option.value === value)
}

/* ---- Tickets ---- */

/* `short` is what fits where there is no room for "Historia de usuario"; `plural` names a
   group of them (the epic's "Por tipo" breakdown). */
export const TICKET_TYPE_OPTIONS = [
  { value: 'userStory', label: 'Historia de usuario', short: 'UH', plural: 'Historias' },
  { value: 'task', label: 'Tarea', short: 'Tarea', plural: 'Tareas' },
  { value: 'bug', label: 'Bug', short: 'Bug', plural: 'Bugs' },
  { value: 'fix', label: 'Fix', short: 'Fix', plural: 'Fixes' },
]

export const TICKET_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'neutral' },
  { value: 'medium', label: 'Media', tone: 'yellow' },
  { value: 'high', label: 'Alta', tone: 'orange' },
  { value: 'critical', label: 'Crítica', tone: 'red' },
]

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

/* ---- Epics ---- */

export const EPIC_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'neutral' },
  { value: 'medium', label: 'Media', tone: 'yellow' },
  { value: 'high', label: 'Alta', tone: 'orange' },
  { value: 'urgent', label: 'Urgente', tone: 'red' },
]

export const EPIC_STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', tone: 'gray' },
  { value: 'active', label: 'Activa', tone: 'blue' },
  { value: 'closed', label: 'Cerrada', tone: 'green' },
]

/* Tailwind needs each class name written out literally somewhere to keep it in the
   build — a template string like `bg-${color}` is invisible to its scanner. */
export const ACCENT_COLORS = [
  { value: 'blue', label: 'Azul', dotClass: 'bg-blue' },
  { value: 'purple', label: 'Violeta', dotClass: 'bg-purple' },
  { value: 'indigo', label: 'Índigo', dotClass: 'bg-indigo' },
  { value: 'teal', label: 'Verde azulado', dotClass: 'bg-teal' },
  { value: 'green', label: 'Verde', dotClass: 'bg-green' },
  { value: 'orange', label: 'Naranja', dotClass: 'bg-orange' },
  { value: 'red', label: 'Rojo', dotClass: 'bg-red' },
  { value: 'pink', label: 'Rosa', dotClass: 'bg-pink' },
  { value: 'mint', label: 'Menta', dotClass: 'bg-mint' },
  { value: 'yellow', label: 'Amarillo', dotClass: 'bg-yellow' },
]

/* ---- Sprints ---- */

export const SPRINT_PLANNED = 'planned'
export const SPRINT_ACTIVE = 'active'
export const SPRINT_COMPLETED = 'completed'

export const SPRINT_STATUS_OPTIONS = [
  { value: 'planned', label: 'Planificado', tone: 'gray' },
  { value: 'active', label: 'Activo', tone: 'blue' },
  { value: 'completed', label: 'Completado', tone: 'green' },
]

/* ---- Users ---- */

/* The API's roles (UserRole in User.cs, camelCase) as the interface names them, from least to
   most privilege — the same order as the C# enum, and lib/roles.js compares ranks by reading
   it. Reordering here changes who may edit whom on screen (never on the server).

   A role's colour is only an identity, to tell one from another down the Equipo list: it does
   not say anything about status or urgency, which is why it may reuse their accents. */
export const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Lector', tone: 'neutral', dotClass: 'bg-gray', description: 'Solo lectura de épicas, tickets y sprints.' },
  { value: 'qa', label: 'QA', tone: 'teal', dotClass: 'bg-teal', description: 'Prueba y valida tickets.' },
  { value: 'developer', label: 'Developer', tone: 'blue', dotClass: 'bg-blue', description: 'Crea y trabaja tickets.' },
  { value: 'scrumMaster', label: 'Scrum Master', tone: 'indigo', dotClass: 'bg-indigo', description: 'Planifica y cierra sprints.' },
  { value: 'productOwner', label: 'Product Owner', tone: 'purple', dotClass: 'bg-purple', description: 'Define épicas y prioridades.' },
  { value: 'admin', label: 'Admin', tone: 'orange', dotClass: 'bg-orange', description: 'Administra este espacio y sus integrantes.' },
  { value: 'superAdmin', label: 'Super Admin', tone: 'red', dotClass: 'bg-red', description: 'Administra la plataforma y a los admins.' },
]

/* The same labels keyed by value, for the places that only need the name (the sidebar card). */
export const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((option) => [option.value, option.label]))
