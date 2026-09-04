import { Field } from './Field'
import { CONTROL_TEXTAREA } from './Field.styles'

/** A multi-line text field. `resize-none` because the sheet decides the height, not the user. */
export function TextAreaField({
  id,
  name,
  label,
  optional = false,
  rows = 2,
  placeholder,
  value,
  disabled = false,
  error,
  onChange,
}) {
  return (
    <Field id={id} label={label} optional={optional} error={error}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={CONTROL_TEXTAREA}
      />
    </Field>
  )
}
