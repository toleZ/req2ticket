/* Shared between the create form (as <select> options and as colour swatches) and the
   list (as badges), so label and colour never drift apart.

   The EPIC_ prefix is not decoration: tickets and sprints have their own scales with
   different values (an epic uses `urgent`, a ticket uses `critical`), and without the
   prefix autocomplete hands you the wrong one without anything failing. */

export const EPIC_PRIORITY_OPTIONS = [
  /* Same urgency scale as ticket priority — see the colour notes in lib/ticketOptions.js. */
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
