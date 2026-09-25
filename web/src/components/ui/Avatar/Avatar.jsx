import { BASE, SIZE_CLASSES } from './Avatar.styles'
import { initialsFromName } from './Avatar.helpers'
import { cn } from '@/lib/cn'
export function Avatar({ name, size = 'sm', className }) {
  return (
    <span
      title={name}
      className={cn(BASE, SIZE_CLASSES[size], className)}
    >
      {name ? initialsFromName(name) : '?'}
    </span>
  )
}
