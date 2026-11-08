import { useState } from 'react'
import { Mail, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { PasswordField } from '@/components/ui/Field/PasswordField'
import { errorMessage } from '@/lib/errors'
import { validateLoginForm } from '@/lib/validate'
import { DEMO_ACCOUNTS, DEMO_PASSWORD, INITIAL_VALUES } from './LoginForm.data' // DEMO — borrar antes de prod
import { DEMO_BOX, DEMO_CHIP, REMEMBER } from './LoginForm.styles'

export function LoginForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
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

  // DEMO — borrar antes de prod.
  function fillDemoAccount(email) {
    setValues({ ...values, email, password: DEMO_PASSWORD })
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
      // A wrong email or password is the API's 401; said in Spanish, without telling which.
      setFormError(err?.status === 401 ? 'El email o la contraseña no son correctos.' : errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-title2 text-label">Bienvenido de nuevo</h1>
        <p className="mt-1 text-footnote text-label-secondary">
          Accede para gestionar tus requisitos y tickets
        </p>
      </div>

      {/* noValidate turns off the browser's own validation bubbles, which appear in the
          system's language. validate.js supplies the messages instead, in Spanish. */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && <FormError>{formError}</FormError>}

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
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChange={handleChange}
        />

        {/* Unticked, the session lives in sessionStorage and dies when the tab closes. Ticked,
            it goes to localStorage and survives closing the browser. */}
        <label htmlFor="remember" className={REMEMBER}>
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

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      {/* DEMO — borrar antes de prod: this block, the import of DEMO_ACCOUNTS and fillDemoAccount. */}
      <div className={DEMO_BOX}>
        <p className="flex items-center gap-1.5">
          <Sparkles className="size-4 shrink-0 text-blue" aria-hidden="true" />
          <span className="font-medium text-label">Cuentas de demostración.</span> Elegí un rol para completar el
          formulario.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button key={account.email} type="button" onClick={() => fillDemoAccount(account.email)} className={DEMO_CHIP}>
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
