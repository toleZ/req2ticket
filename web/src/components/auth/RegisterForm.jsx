import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

import { validateRegisterForm } from '@/lib/validate'

const INITIAL_VALUES = { name: '', email: '', password: '', confirmPassword: '' }

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary py-2 pr-3 pl-9 text-body text-label'
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
    setValues({ ...values, [e.target.name]: e.target.value })
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
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-title2 text-label">Creá tu cuenta</h1>
        <p className="mt-1 text-footnote text-label-secondary">
          Sumate para gestionar tus requisitos e historias
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && (
          <p className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red" role="alert">
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="name" className="mb-1 block text-subheadline font-medium text-label">
            Nombre completo
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <User className="h-4 w-4" />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ana Pérez"
              value={values.name}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          {errors.name && <p className="mt-1 text-footnote text-red">{errors.name}</p>}
        </div>

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
              autoComplete="email"
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
              autoComplete="new-password"
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-subheadline font-medium text-label"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <span className={INPUT_ICON_CLASSES} aria-hidden="true">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={handleChange}
              className={`${INPUT_CLASSES} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-label-secondary"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-footnote text-red">{errors.confirmPassword}</p>
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
