import { cn } from '@/lib/cn'
import { findOption } from '@/lib/options'
import { TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'
import { TONE_CLASSES } from './TicketTypeIcon.styles'
import { TYPE_ICONS } from './TicketTypeIcon.data'
/**
 * A ticket type's icon, already painted in the colour it gets.
 *
 * `aria-hidden`: there is always a badge or a piece of text next to it naming the type in
 * words, so announcing it twice only gets in the way of anyone using a screen reader.
 */
export function TicketTypeIcon({ type, className }) {
  const option = findOption(TICKET_TYPE_OPTIONS, type)
  const Icon = TYPE_ICONS[type]

  // A type we do not know (an API newer than this front end) does not break the row: it draws nothing.
  if (!Icon) return null

  return (
    <Icon
      aria-hidden="true"
      className={cn('shrink-0', option && TONE_CLASSES[option.tone], className)}
    />
  )
}
