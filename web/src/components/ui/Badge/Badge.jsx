import { BASE, TONE_CLASSES } from './Badge.styles'
import { cn } from '@/lib/cn'
export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cn(BASE, TONE_CLASSES[tone] ?? TONE_CLASSES.neutral, className)}
    >
      {children}
    </span>
  )
}
