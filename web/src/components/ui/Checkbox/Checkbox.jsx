import { Check } from 'lucide-react'

import { cn } from '@/lib/cn'

/* The native input stays in the page, invisible (`sr-only`), so Space, the label and a screen
   reader all work as with any checkbox. What you see is the box drawn next to it, which reads
   the input's state through `peer-*`. */
const BOX = `grid size-4.5 shrink-0 place-items-center border border-separator-opaque bg-elevated text-white
  transition-[background-color,border-color] duration-fast peer-focus-visible:outline-3
  peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue/55 peer-disabled:opacity-40`

const SHAPE_CLASSES = {
  square: 'rounded-[0.3rem]',
  round: 'rounded-full',
}

/**
 * A checkbox in the app's style. `square` for choices (a cell of the workflow grid, a filter);
 * `round` for things to do (a checklist item), like ChecklistField.
 *
 *     <Checkbox id="t-todo-progress" checked={on} ariaLabel="De Por hacer a En progreso" onChange={setOn} />
 *     <Checkbox id="remember" checked={remember} label="Recordarme" onChange={setRemember} />
 *
 * `onChange` receives the new value (true / false), not the event. Without a visible `label`,
 * pass `ariaLabel`.
 */
export function Checkbox({
  id,
  checked,
  label,
  description,
  ariaLabel,
  shape = 'square',
  invalid = false,
  disabled = false,
  onChange,
}) {
  return (
    <label
      htmlFor={id}
      className={cn('inline-flex items-start gap-2.5', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={invalid ? true : undefined}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          BOX,
          SHAPE_CLASSES[shape],
          label && 'mt-0.5',
          checked && 'border-blue bg-blue',
          invalid && !checked && 'border-red',
        )}
      >
        {checked && <Check className="size-3 animate-tick-in" strokeWidth={3.5} />}
      </span>
      {label && (
        <span className="min-w-0">
          <span className="block text-subheadline text-label">{label}</span>
          {description && <span className="block text-footnote text-label-secondary">{description}</span>}
        </span>
      )}
    </label>
  )
}
