import { Field } from './Field'
import { CONTROL } from './Field.styles'

/**
 * A dropdown. The <option>s are children rather than an `options` prop: the lists in this app
 * are not the same shape — some map `{value, label}`, others `{id, name}`, and some open with
 * an empty choice — and writing them at the call site keeps those differences visible.
 */
export function SelectField({
  id,
  name,
  label,
  optional = false,
  value,
  disabled = false,
  error,
  onChange,
  children,
}) {
  return (
    <Field id={id} label={label} optional={optional} error={error}>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={CONTROL}
      >
        {children}
      </select>
    </Field>
  )
}
