import { useState } from 'react'

import { errorMessage } from '@/lib/errors'
import { validateRegisterForm } from '@/lib/validate'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
const INITIAL_VALUES = { fullName: '', email: '' }

export function RegisterForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitted, setSubmitted] = useState(false)

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
    const found = validateRegisterForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit(values)
      setSubmitted(true)
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center" role="status">
        <h2 className="text-title3 text-label">Solicitud enviada</h2>
        <p className="mt-1 text-footnote text-label-secondary">
          Gracias, {values.fullName.trim().split(' ')[0]}. Te escribimos a {values.email} en
          cuanto aprobemos tu acceso.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <p className="text-footnote text-label-secondary">
        Estamos en beta y el acceso es por invitación. Dejanos tus datos y te avisamos por
        correo en cuanto podamos sumarte.
      </p>

      {formError && (
        <p className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red" role="alert">
          {formError}
        </p>
      )}

      {/* Each field is one <div>, and that matters: the form is `flex flex-col gap-4`, so
          label + input + error as loose siblings would get two extra gaps between them. */}
      <div>
        <label
          htmlFor="register-fullName"
          className="mb-1 block text-subheadline font-medium text-label"
        >
          Nombre completo
        </label>
        <input
          id="register-fullName"
          type="text"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={handleChange}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? 'register-fullName-error' : undefined}
          className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
        />
        {errors.fullName && (
          <p id="register-fullName-error" className="mt-1 text-footnote text-red">
            {errors.fullName}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="mb-1 block text-subheadline font-medium text-label"
        >
          Correo electrónico
        </label>
        <input
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
        />
        {errors.email && (
          <p id="register-email-error" className="mt-1 text-footnote text-red">
            {errors.email}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-control bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? 'Enviando solicitud…' : 'Solicitar acceso'}
      </button>
    </form>
  )
}
