import { cn } from '@/lib/cn'

/* An on/off switch with its text: the whole thing is the button, announced as a switch. */
export function Switch({ checked, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group/switch inline-flex min-h-11 items-center gap-2 text-footnote text-label-secondary transition-colors duration-fast hover:text-label lg:min-h-8"
    >
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-fast',
          checked ? 'bg-blue' : 'bg-fill-secondary',
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-hairline transition-transform duration-base ease-ios',
            checked && 'translate-x-4',
          )}
        />
      </span>
      <span className={checked ? 'font-medium text-label' : undefined}>{label}</span>
    </button>
  )
}
