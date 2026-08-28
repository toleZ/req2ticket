import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

import { errorMessage } from '@/lib/errors'
import { validateRegisterForm } from '@/lib/validate'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
const INITIAL_VALUES = { name: '', email: '', password: '', confirmPassword: '' }

/* El pl-9 deja lugar al icono que va dentro del input. El padding derecho cambia según
   lleve o no el ojo encima, y por eso son dos constantes en vez de `${INPUT_CLASSES} pr-10`:
   sin twMerge acá quedarían pr-3 y pr-10 juntas en el DOM y el ganador lo decidiría el
   orden del CSS, no el orden en que las escribimos. */
const INPUT_BASE =
  'w-full rounded-control border border-separator bg-fill-tertiary py-2 pl-9 text-body text-label'
const INPUT_CLASSES = `${INPUT_BASE} pr-3`
const INPUT_CLASSES_WITH_TOGGLE = `${INPUT_BASE} pr-10`

const INPUT_ICON_CLASSES =
  'pointer-events-none absolute inset-y-0 left-3 flex items-center text-label-tertiary'

export function RegisterForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState('')

  function handleChange(e) {
    const nextValues = { ...values, [e.target.name]: e.target.value }
    setValues(nextValues)

    // If the field already had an error, it is re-checked as you type so the message
    // disappears as soon as you fix it. A field with no error yet is not validated until
    // submit.
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: validateRegisterForm(nextValues)[e.target.name] })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const foundErrors = validateRegisterForm(values)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length > 0) return

    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-title2 text-label">Creá tu cuenta</h1>
        <p className="mt-1 text-footnote text-label-secondary">
          Sumate para gestionar tus requisitos y tickets
        </p>
      </div>

      {/* noValidate turns off the browser's own validation bubbles, which appear in the
          system's language. validate.js supplies the messages instead, in Spanish. */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && (
          <p
            className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red"
            role="alert"
          >
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="name" className="mb-1 block text-subheadline font-medium text-label">
            Nombre completo
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <User className="size-4" />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ana Pérez"
              value={values.name}
              onChange={handleChange}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={INPUT_CLASSES}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="mt-1 text-footnote text-red">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-subheadline font-medium text-label">
            Correo electrónico
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <Mail className="size-4" />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@empresa.com"
              value={values.email}
              onChange={handleChange}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={INPUT_CLASSES}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1 text-footnote text-red">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-subheadline font-medium text-label">
            Contraseña
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <Lock className="size-4" />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={INPUT_CLASSES_WITH_TOGGLE}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-label-secondary"
            >
              {showPassword ? (
                <EyeOff className="size-5" aria-hidden="true" />
              ) : (
                <Eye className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-footnote text-red">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-subheadline font-medium text-label"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <Lock className="size-4" />
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={handleChange}
              aria-invalid={errors.confirmPassword ? true : undefined}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              className={INPUT_CLASSES_WITH_TOGGLE}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-label-secondary"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-5" aria-hidden="true" />
              ) : (
                <Eye className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-footnote text-red">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-control bg-blue px-4 py-2 text-body font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}
