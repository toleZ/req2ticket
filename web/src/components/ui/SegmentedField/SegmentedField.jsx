import { useId } from 'react'

import { SelectionPill } from '@/components/ui/SelectionPill/SelectionPill'
import { cn } from '@/lib/cn'
import { GROUP, INNER_RADIUS, OPTION } from './SegmentedField.styles'

/* Native radios under the hood, so Tab reaches the group once and the arrows move the choice. */
export function SegmentedField({ name, legend, options, value, disabled = false, onChange, className }) {
  const pillId = useId()

  return (
    <fieldset className={cn(GROUP, className)} disabled={disabled}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const Icon = option.icon
        return (
          <label key={option.value} className="relative flex flex-1">
            {value === option.value && (
              <SelectionPill
                layoutId={pillId}
                className={cn('absolute inset-0 bg-elevated shadow-hairline', INNER_RADIUS)}
              />
            )}
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className={OPTION}>
              {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
              {option.label}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
