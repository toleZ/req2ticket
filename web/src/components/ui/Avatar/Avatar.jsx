import { SIZE_CLASSES } from './Avatar.styles'
import { initialsFromName } from './Avatar.helpers'
import { cn } from '@/lib/cn'
export function Avatar({ name, size = 'sm', className }) {
  return (
    <span
      title={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-fill-tertiary font-semibold text-label-secondary',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {name ? initialsFromName(name) : '?'}
    </span>
  )
}
