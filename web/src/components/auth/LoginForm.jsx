import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'

import { validateLoginForm } from '@/lib/validate'

const INITIAL_VALUES = { email: '', password: '', remember: false }

/* Credenciales de la cuenta de demo: el botón de abajo las completa por el usuario. */
const DEMO_ACCOUNT = { email: 'juan@req2ticket.com', password: 'Passw0rd!' }

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary py-2 pr-3 pl-9 text-body text-label'
const INPUT_ICON_CLASSES =
  'pointer-events-none absolute inset-y-0 left-3 flex items-center text-label-tertiary'

export function LoginForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value

    setValues({ ...values, [e.target.name]: value })
  }

  function fillDemoAccount() {
    setValues({ ...values, email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password })
    setErrors({})
    setFormError('')
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
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-title2 text-label">Bienvenido de nuevo</h1>
        <p className="mt-1 text-footnote text-label-secondary">
          Accede para gestionar tus requisitos e historias
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <p className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red" role="alert">
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-subheadline font-medium text-label">
            Correo electrónico
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@empresa.com"
              value={values.email}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          {errors.email && <p className="mt-1 text-footnote text-red">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-subheadline font-medium text-label">
            Contraseña
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              className={`${INPUT_CLASSES} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-label-secondary"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-footnote text-red">{errors.password}</p>}
        </div>

        {/* Sin marcar, la sesión vive en sessionStorage y muere al cerrar la pestaña.
            Marcado, va a localStorage y sobrevive cerrar el navegador. */}
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
          className="rounded-control bg-blue px-4 py-2 text-body font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <button
        type="button"
        onClick={fillDemoAccount}
        className="mt-4 flex w-full items-start gap-2 rounded-control bg-fill-tertiary p-3 text-left text-footnote text-label-secondary transition-colors hover:bg-fill-secondary"
      >
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
        <span>
          <span className="font-medium text-label">Cuenta de demostración. </span>
          Pulsá aquí para completar el correo y la contraseña de la cuenta de prueba.
        </span>
      </button>
    </div>
  )
}
