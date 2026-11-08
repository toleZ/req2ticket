import { TYPE_ICONS } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon.data'
import { EASE_IOS } from '@/lib/motion'
import { TICKET_TYPE_OPTIONS } from '@/lib/options'
import { TYPE_CARD_TEXT, emptyTypeFields } from '@/lib/ticketTypes'

/* The form's starting point. `defaults` presets what a shortcut already knows ("Agregar tarea"
   from a story knows the type, the parent, the epic and the sprint). No status: every ticket is
   born "todo". `typeFields` holds the chosen type's own fields (lib/ticketTypes.js). */
export function initialValues(defaults = {}) {
  const type = defaults.type ?? 'userStory'

  return {
    type,
    title: '',
    description: '',
    epicId: defaults.epicId ? String(defaults.epicId) : '',
    priority: 'medium',
    points: '',
    assigneeId: '',
    sprintId: defaults.sprintId ? String(defaults.sprintId) : '',
    parentId: defaults.parentId ? String(defaults.parentId) : '',
    typeFields: emptyTypeFields(type),
  }
}

/* Where the focus goes when submit finds an error, keyed like validateTicketForm's result. */
export const FIELD_IDS = {
  title: 'ticket-title',
  epicId: 'ticket-epic',
  parentId: 'ticket-parent',
  stepsToReproduce: 'ticket-nuevo-stepsToReproduce',
}

/* The four cards of the first step. */
export const TYPE_CARDS = TICKET_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  text: TYPE_CARD_TEXT[option.value],
  icon: TYPE_ICONS[option.value],
}))

export const NEW_TITLE = {
  userStory: 'Nueva historia de usuario',
  task: 'Nueva tarea',
  bug: 'Nuevo bug',
  fix: 'Nuevo fix',
}

export const CREATE_LABEL = {
  userStory: 'Crear historia',
  task: 'Crear tarea',
  bug: 'Crear bug',
  fix: 'Crear fix',
}

/* The form appearing after the type is chosen: it rises in. */
export const SWAP = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_IOS } },
}
