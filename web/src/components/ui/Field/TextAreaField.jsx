import { useId } from 'react'

import { cn } from '@/lib/cn'
import { Field } from './Field'
import { CONTROL_TEXTAREA } from './Field.styles'

/* The counter appears from this share of the limit up: a long description sees it coming,
   a short one never has it in the way. */
const SHOW_COUNTER_AT = 0.8

/**
 * A multi-line text field. `resize-none` because the sheet decides the height, not the user.
 *
 * `maxLength` stops typing (and pasting) at the API's limit (ENT-6) and shows "1650 / 2000"
 * under the field once the text reaches 80% of it.
 */
export function TextAreaField({
  id,
  name,
  label,
  optional = false,
  rows = 2,
  placeholder,
  value,
  maxLength,
  disabled = false,
  error,
  onChange,
}) {
  const counterId = useId()
  const length = value?.length ?? 0
  const showCounter = Boolean(maxLength) && length >= maxLength * SHOW_COUNTER_AT
  const describedBy = [error && `${id}-error`, showCounter && counterId].filter(Boolean).join(' ')

  return (
    <Field id={id} label={label} optional={optional} error={error}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={CONTROL_TEXTAREA}
      />
      {showCounter && (
        <p
          id={counterId}
          className={cn(
            'mt-1 animate-fade-in text-right text-caption tabular-nums',
            length >= maxLength ? 'font-medium text-red-text' : 'text-label-secondary',
          )}
        >
          {length} / {maxLength}
          {length >= maxLength && <span className="sr-only"> caracteres, llegaste al máximo</span>}
        </p>
      )}
    </Field>
  )
}
