import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

import { Field } from './Field'
import { CONTROL_PASSWORD, ICON_WRAP, TOGGLE } from './Field.styles'

/**
 * A password field with the show/hide eye.
 *
 * `isVisible` is the only state here, and it is local on purpose: the register form has two of
 * these and each has to reveal itself without dragging the other along.
 */
export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  placeholder,
  value,
  disabled = false,
  error,
  onChange,
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <span className={ICON_WRAP} aria-hidden="true">
          <Lock className="size-4" />
        </span>
        <input
          id={id}
          name={name}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={CONTROL_PASSWORD}
        />
        <button
          type="button"
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setIsVisible(!isVisible)}
          className={TOGGLE}
        >
          {isVisible ? (
            <EyeOff className="size-5" aria-hidden="true" />
          ) : (
            <Eye className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
  )
}
