import { TYPE_ICONS } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon.data'
import { EASE_IOS, exitQuick } from '@/lib/motion'
import { TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'

export const INITIAL_TYPE = 'userStory'

export const INITIAL_VALUES = {
  type: INITIAL_TYPE,
  title: '',
  description: '',
  epicId: '',
  priority: 'medium',
  status: 'todo',
  points: '',
  assigneeId: '',
  sprintId: '',
}

export const FIELD_IDS = { title: 'ticket-title', epicId: 'ticket-epic' }

export const TYPE_SEGMENTS = TICKET_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.value === 'userStory' ? 'Historia' : option.label,
  icon: TYPE_ICONS[option.value],
}))

export const CREATE_LABEL = {
  userStory: 'Crear historia',
  task: 'Crear tarea',
  bug: 'Crear bug',
  fix: 'Crear fix',
}

/* Switching type: the old fields leave quickly, then the new ones rise in. */
export const SWAP = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_IOS } },
  exit: { opacity: 0, y: -4, transition: exitQuick },
}

/* A type's own sidebar field grows in and out, so what sits below slides instead of jumping.
   Overflow is clipped only while it moves, or it would cut the focus ring. */
export const GROW = {
  initial: { height: 0, opacity: 0, overflow: 'hidden' },
  animate: { height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } },
  exit: { height: 0, opacity: 0, overflow: 'hidden' },
  transition: { duration: 0.22, ease: EASE_IOS },
}
