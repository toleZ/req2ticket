import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { errorMessage } from '@/lib/errors'
import { validateLoginForm } from '@/lib/validate'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
const INITIAL_VALUES = { email: '', password: '', remember: false }

export function LoginForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    const nextValues = { ...values, [e.target.name]: value }
    setValues(nextValues)

    // If the field already had an error, it is re-checked as you type so the message
    // disappears as soon as you fix it. A field with no error yet is not validated until
    // submit.
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: validateLoginForm(nextValues)[e.target.name] })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const foundErrors = validateLoginForm(values)
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

  /* noValidate turns off the browser's own validation bubbles, which appear in the
     system's language. validate.js supplies the messages instead, in Spanish. */
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {formError && (
        <p className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red" role="alert">
          {formError}
        </p>
      )}

      {/* Each field is one <div>: the form is `flex flex-col gap-4`, so label + input +
          error as loose siblings would pick up two extra gaps. */}
      <div>
        <label htmlFor="login-email" className="mb-1 block text-subheadline font-medium text-label">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
        />
        {errors.email && (
          <p id="login-email-error" className="mt-1 text-footnote text-red">
            {errors.email}
          </p>
        )}
      </div>

      {/* The input carries the show/hide eye on top of it, hence the `relative` div and the
          pr-10 that keeps the text clear of the icon. */}
      <div>
        <label htmlFor="password" className="mb-1 block text-subheadline font-medium text-label">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="w-full rounded-control border border-separator bg-fill-tertiary py-2 pr-10 pl-3 text-body text-label disabled:opacity-50"
          />
          {/* type="button" is not optional here: the browser's default is "submit", so
              without it clicking the eye submits the login form. */}
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 grid h-full w-8 shrink-0 place-items-center rounded-control rounded-l-none text-label-secondary transition-colors duration-fast ease-out-quad hover:bg-fill-tertiary hover:text-label disabled:opacity-50"
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

      {/* Unchecked, the session lives in sessionStorage and dies when the tab closes.
          Checked, it goes to localStorage and survives closing the browser. */}
      <label htmlFor="remember" className="flex items-center gap-2 text-subheadline text-label">
        <input
          id="remember"
          name="remember"
          type="checkbox"
          checked={values.remember}
          onChange={handleChange}
          className="size-4 shrink-0 accent-blue"
        />
        Mantener sesión
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-control bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
