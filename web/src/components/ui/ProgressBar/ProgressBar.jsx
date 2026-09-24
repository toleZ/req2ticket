import { SIZE_CLASSES } from './ProgressBar.styles'
import { cn } from '@/lib/cn'
/**
 * `label` names the bar for screen readers ("Checklist 2 de 5"): a progressbar without a name
 * is announced as just a percentage of nothing. `decorative` is for a bar that sits inside
 * something already labelled — a row's button that says "checklist 2 de 5" — where a second
 * announcement would only repeat it; it takes the bar out of the accessibility tree.
 */
export function ProgressBar({ value, max = 100, size = 'md', label, decorative = false, className }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      role={decorative ? undefined : 'progressbar'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      aria-valuenow={decorative ? undefined : value}
      aria-valuemin={decorative ? undefined : 0}
      aria-valuemax={decorative ? undefined : max}
      className={cn(
        'w-full overflow-hidden rounded-full bg-fill-tertiary',
        SIZE_CLASSES[size],
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-blue transition-[width] duration-base ease-out-quad"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
