import { cn } from '@/lib/cn'
import { TYPE_ICONS } from './TicketTypeIcon.data'
/**
 * A ticket type's icon. Grey on purpose: the type is told apart by the icon's shape, and
 * colour is left to the status and the priority (see the notes in lib/options.js).
 *
 * `aria-hidden`: every place that draws it names the type in words somewhere a screen reader
 * reads — the rows put it in their button's label, the detail sheet shows it as text.
 */
export function TicketTypeIcon({ type, className }) {
  const Icon = TYPE_ICONS[type]

  // A type we do not know (an API newer than this front end) does not break the row: it draws nothing.
  if (!Icon) return null

  return <Icon aria-hidden="true" className={cn('shrink-0 text-label-secondary', className)} />
}
