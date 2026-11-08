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

/* A bug's severity and a fix's regression risk: the only dropdowns a type has of its own. */
export const BUG_SEVERITY_OPTIONS = [
  { value: 'blocker', label: 'Bloqueante' },
  { value: 'major', label: 'Mayor' },
  { value: 'minor', label: 'Menor' },
  { value: 'trivial', label: 'Trivial' },
]

export const REGRESSION_RISK_OPTIONS = [
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
]

export const TICKET_DONE = 'done'

/* Terminal but not successful. It counts as neither done nor pending: summarizeTickets takes
   it out of the total, so a cancelled ticket does not drag a sprint's percentage down
   forever. */
export const TICKET_CANCELLED = 'cancelled'

/* "Open" means anything that is not done or cancelled (DEC-5), same as the API. */
export function isOpenStatus(status) {
  return status !== TICKET_DONE && status !== TICKET_CANCELLED
}

/* In flow order, and that order matters: the Tickets page draws one section per status and the
   board one column per status by reading this array (not the C# enum). Reordering here
   reorders them. There is no "backlog" status: being in the backlog means having no sprint. */
export const TICKET_STATUS_OPTIONS = [
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

/* ---- Roles ---- */

/* The roles INSIDE A PROJECT (ProjectRole in the API), from least to most privilege. The same
   person can be Admin in one project and Lector in another. What each role may do is not
   written here: it comes from the API (GET /api/roles, and myPermissions of the project), so
   `description` is only the one-line summary the role picker shows.

   A role's colour is only an identity, to tell one from another down the Equipo list: it does
   not say anything about status or urgency, which is why it may reuse their accents. */
export const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Lector', tone: 'neutral', dotClass: 'bg-gray', description: 'Ve todo el proyecto, sin cambiar nada.' },
  { value: 'qa', label: 'QA', tone: 'teal', dotClass: 'bg-teal', description: 'Crea, prueba y actualiza tickets.' },
  { value: 'developer', label: 'Developer', tone: 'blue', dotClass: 'bg-blue', description: 'Crea y trabaja tickets.' },
  { value: 'scrumMaster', label: 'Scrum Master', tone: 'indigo', dotClass: 'bg-indigo', description: 'Gestiona sprints y el workflow, crea y borra tickets.' },
  { value: 'productOwner', label: 'Product Owner', tone: 'purple', dotClass: 'bg-purple', description: 'Define épicas y prioridades, crea y borra tickets.' },
  { value: 'admin', label: 'Admin', tone: 'orange', dotClass: 'bg-orange', description: 'Todo lo anterior, más el equipo y los datos del proyecto.' },
]

/* The same labels keyed by value, for the places that only need the name (the sidebar card).
   `superAdmin` is not a project role: it is what a SuperAdmin sees in a project they are not a
   member of, where they act as Admin anyway. */
export const ROLE_LABELS = {
  ...Object.fromEntries(ROLE_OPTIONS.map((option) => [option.value, option.label])),
  superAdmin: 'SuperAdmin',
}

/* What each permission means, for "¿Qué puede hacer cada rol?" and the role chip. The keys are
   the API's permission names (see lib/permissions.js). */
export const PERMISSION_LABELS = {
  'tickets.write': 'Crear y editar tickets, cambiar su estado y asignarlos',
  'tickets.delete': 'Borrar tickets',
  'epics.manage': 'Crear, editar, cerrar y borrar épicas',
  'sprints.manage': 'Crear, iniciar, completar y borrar sprints',
  'workflow.edit': 'Editar el workflow',
  'project.edit': 'Editar los datos del proyecto',
  'project.archive': 'Archivar y restaurar el proyecto',
  'members.manage': 'Agregar, quitar y cambiar el rol de integrantes',
}

/* The platform role of a user. Only SuperAdmin means anything: it is Admin in every project. */
export const PLATFORM_SUPER_ADMIN = 'superAdmin'
