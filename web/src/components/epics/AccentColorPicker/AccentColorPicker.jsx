import { cn } from '@/lib/cn'
import { ACCENT_COLORS } from '@/lib/epicOptions'
import { SELECTED, SIZE_CLASSES, SWATCH } from './AccentColorPicker.styles'
/**
 * The epic's accent colour, as the row of swatches from the design.
 *
 * Not a text field: these are buttons that paint a colour, so there is no <input> and nothing
 * goes through a form's handleChange — `onChange` receives the value directly.
 *
 * It renders the radiogroup and nothing else. The heading above it stays at the call site,
 * because the two callers word it differently: the create modal uses a form label, the detail
 * modal a smaller side-column caption.
 *
 * The classes come from ACCENT_COLORS' `dotClass` and not from a `bg-${color}` template, for
 * the reason lib/epicOptions.js spells out: Tailwind reads the code as text.
 */
export function AccentColorPicker({ value, onChange, disabled = false, size = 'md' }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color de acento">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          role="radio"
          aria-checked={value === color.value}
          aria-label={color.value}
          disabled={disabled}
          onClick={() => onChange(color.value)}
          className={cn(
            SWATCH,
            SIZE_CLASSES[size],
            color.dotClass,
            value === color.value && SELECTED,
          )}
        />
      ))}
    </div>
  )
}
