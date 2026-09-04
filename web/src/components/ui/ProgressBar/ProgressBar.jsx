import { SIZE_CLASSES } from './ProgressBar.styles'
import { cn } from '@/lib/cn'
export function ProgressBar({ value, max = 100, size = 'md', className }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
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
