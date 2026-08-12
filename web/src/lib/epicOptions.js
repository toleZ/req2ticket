/* Shared between the create form (as <select> options / swatches) and the list (as
   badges), so the two never drift out of sync on labels or colors. */

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'gray' },
  { value: 'medium', label: 'Media', tone: 'blue' },
  { value: 'high', label: 'Alta', tone: 'orange' },
  { value: 'urgent', label: 'Urgente', tone: 'red' },
]

export const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', tone: 'gray' },
  { value: 'active', label: 'Activa', tone: 'blue' },
  { value: 'closed', label: 'Cerrada', tone: 'green' },
]

/* Tailwind needs each class name written out literally somewhere to keep it in the
   build — a template string like `bg-${color}` is invisible to its scanner. */
export const ACCENT_COLORS = [
  { value: 'blue', dotClass: 'bg-blue' },
  { value: 'purple', dotClass: 'bg-purple' },
  { value: 'indigo', dotClass: 'bg-indigo' },
  { value: 'teal', dotClass: 'bg-teal' },
  { value: 'green', dotClass: 'bg-green' },
  { value: 'orange', dotClass: 'bg-orange' },
  { value: 'red', dotClass: 'bg-red' },
  { value: 'pink', dotClass: 'bg-pink' },
  { value: 'mint', dotClass: 'bg-mint' },
  { value: 'yellow', dotClass: 'bg-yellow' },
]

export function findOption(options, value) {
  return options.find((option) => option.value === value)
}
