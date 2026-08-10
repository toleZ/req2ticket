import { useState } from 'react'
import { validateRegisterForm } from '@/lib/validate'

const INITIAL_VALUES = { fullName: '', email: '', password: '', confirmPassword: '' }

const FIELDS = [
  { name: 'fullName', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Contraseña', type: 'password', autoComplete: 'new-password' },
  {
    name: 'confirmPassword',
    label: 'Confirmar contraseña',
    type: 'password',
    autoComplete: 'new-password',
  },
]

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label'

/**
 * @param {{ onSubmit: (values: typeof INITIAL_VALUES) => Promise<void> }} props
 */
export function RegisterForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const set = (field) => (e) => {
    const nextValues = { ...values, [field]: e.target.value }
    setValues(nextValues)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateRegisterForm(nextValues)[field] }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateRegisterForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit(values)
      setSubmitted(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center" role="status">
        <h2 className="text-title3 text-label">Cuenta creada</h2>
        <p className="mt-1 text-footnote text-label-secondary">
          Bienvenido, {values.fullName.trim().split(' ')[0]}. Ya podés iniciar sesión.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {formError && (
        <p className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red" role="alert">
          {formError}
        </p>
      )}

      {FIELDS.map(({ name, label, type, autoComplete }) => (
        <div key={name}>
          <label htmlFor={name} className="mb-1 block text-subheadline font-medium text-label">
            {label}
          </label>
          <input
            id={name}
            name={name}
            type={type}
            autoComplete={autoComplete}
            value={values[name]}
            onChange={set(name)}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
            className={INPUT_CLASSES}
          />
          {errors[name] && (
            <p className="mt-1 text-footnote text-red" id={`${name}-error`}>
              {errors[name]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-control bg-blue px-4 py-2 text-body font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
