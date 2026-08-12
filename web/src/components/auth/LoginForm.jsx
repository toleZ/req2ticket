import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { validateLoginForm } from '@/lib/validate'

const INITIAL_VALUES = { email: '', password: '' }

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label'

export function LoginForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
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
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          className={INPUT_CLASSES}
        />
        {errors.email && <p className="mt-1 text-footnote text-red">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-subheadline font-medium text-label">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
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

      <button
        type="submit"
        disabled={submitting}
        className="rounded-control bg-blue px-4 py-2 text-body font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
