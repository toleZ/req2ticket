import { cn } from '@/lib/cn'
import { SWITCH, THUMB, TRACK } from './Switch.styles'

/* An on/off switch with its text: the whole thing is the button, announced as a switch. */
export function Switch({ checked, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={SWITCH}
    >
      <span
        className={cn(TRACK, checked ? 'bg-blue' : 'bg-fill-secondary')}
        aria-hidden="true"
      >
        <span
          className={cn(THUMB, checked && 'translate-x-4')}
        />
      </span>
      <span className={checked ? 'font-medium text-label' : undefined}>{label}</span>
    </button>
  )
}
