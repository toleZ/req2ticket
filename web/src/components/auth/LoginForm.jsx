import { useState } from 'react'
import { validateLoginForm } from '@/lib/validate'

const INITIAL_VALUES = { email: '', password: '' }

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label'

// Simple inline icons — no icon library installed yet, and these two are all we need.
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a17.6 17.6 0 0 1-3.6 4.3M6.5 6.6A17.9 17.9 0 0 0 1 12s4 7 11 7a10.6 10.6 0 0 0 4.2-.86"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * @param {{ onSubmit: (values: typeof INITIAL_VALUES) => Promise<void> }} props
 */
export function LoginForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const foundErrors = validateLoginForm(values)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
