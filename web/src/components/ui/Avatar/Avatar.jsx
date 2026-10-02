import { BASE, NEUTRAL, SIZE_CLASSES, TONE_CLASSES } from './Avatar.styles'
import { initialsFromName, toneFromId } from './Avatar.helpers'
import { cn } from '@/lib/cn'

/* Grey by default. Pass `colorKey` (a user's id) and it takes one of the accents instead,
   always the same one for the same person: the Equipo list uses it so eleven rows of
   initials are not eleven identical grey circles. */
export function Avatar({ name, size = 'sm', colorKey, className }) {
  const tone = colorKey === undefined ? NEUTRAL : TONE_CLASSES[toneFromId(colorKey)]

  return (
    <span
      title={name}
      className={cn(BASE, SIZE_CLASSES[size], tone, className)}
    >
      {name ? initialsFromName(name) : '?'}
    </span>
  )
}
