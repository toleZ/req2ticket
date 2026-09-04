import { Field } from './Field'
import { CONTROL, CONTROL_ICON, ICON_WRAP } from './Field.styles'

/**
 * A single-line text field. Pass `icon` a lucide component and it is drawn inside the input.
 *
 * There are a lot of props and that is deliberate — the same argument TicketFilterBar makes:
 * a flat column of named props reads better at the call site than a config object, and nothing
 * is hidden behind a spread.
 */
export function TextField({
  id,
  name,
  label,
  optional = false,
  icon: Icon,
  type = 'text',
  min,
  placeholder,
  autoComplete,
  value,
  disabled = false,
  error,
  onChange,
}) {
  const input = (
    <input
      id={id}
      name={name}
      type={type}
      min={min}
      placeholder={placeholder}
      autoComplete={autoComplete}
      value={value}
      disabled={disabled}
      onChange={onChange}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={Icon ? CONTROL_ICON : CONTROL}
    />
  )

  return (
    <Field id={id} label={label} optional={optional} error={error}>
      {Icon ? (
        <div className="relative">
          <span className={ICON_WRAP} aria-hidden="true">
            <Icon className="size-4" />
          </span>
          {input}
        </div>
      ) : (
        input
      )}
    </Field>
  )
}
