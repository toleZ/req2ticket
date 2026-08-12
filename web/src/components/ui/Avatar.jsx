import { cn } from '@/lib/cn'

const SIZE_CLASSES = {
  sm: 'size-6 text-caption2',
  md: 'size-8 text-caption',
}

function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

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
