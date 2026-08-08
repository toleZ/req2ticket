import { useState } from 'react'
import { validateRegisterForm } from '@/lib/validate'
import './RegisterForm.css'

const INITIAL_VALUES = { fullName: '', email: '', password: '', confirmPassword: '' }

const FIELDS = [
  { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    type: 'password',
    autoComplete: 'new-password',
  },
]

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
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="register-form register-form--success" role="status">
        <h2>Account created</h2>
        <p>Welcome, {values.fullName.split(' ')[0]}. You can sign in now.</p>
      </div>
    )
  }

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <h2>Create an account</h2>

      {formError && (
        <p className="register-form__error" role="alert">
          {formError}
        </p>
      )}

      {FIELDS.map(({ name, label, type, autoComplete }) => (
        <div className="register-form__field" key={name}>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            name={name}
            type={type}
            autoComplete={autoComplete}
            value={values[name]}
            onChange={set(name)}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
          />
          {errors[name] && (
            <p className="register-form__field-error" id={`${name}-error`}>
              {errors[name]}
            </p>
          )}
        </div>
      ))}

      <button type="submit" className="register-form__submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
