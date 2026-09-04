import { TONE_CLASSES } from './Badge.styles'
import { cn } from '@/lib/cn'
export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-control px-2 py-0.5 text-caption font-medium',
        TONE_CLASSES[tone] ?? TONE_CLASSES.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}
