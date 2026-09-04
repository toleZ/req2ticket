import { useState } from 'react'
import { Mail, User } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { PasswordField } from '@/components/ui/Field/PasswordField'

import { errorMessage } from '@/lib/errors'
import { validateRegisterForm } from '@/lib/validate'
import { INITIAL_VALUES } from './RegisterForm.data'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
export function RegisterForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
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
        {formError && <FormError>{formError}</FormError>}

        <TextField
          id="name"
          name="name"
          label="Nombre completo"
          icon={User}
          autoComplete="name"
          placeholder="Ana Pérez"
          value={values.name}
          error={errors.name}
          onChange={handleChange}
        />

        <TextField
          id="email"
          name="email"
          label="Correo electrónico"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="tu@empresa.com"
          value={values.email}
          error={errors.email}
          onChange={handleChange}
        />

        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChange={handleChange}
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar contraseña"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={handleChange}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </div>
  )
}
