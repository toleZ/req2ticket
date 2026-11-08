import { useState } from 'react'
import { Mail } from 'lucide-react'

import { RolePicker } from '@/components/team/RolePicker/RolePicker'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { errorMessage } from '@/lib/errors'
import { validateMemberForm } from '@/lib/validate'
import { EMAIL_ERRORS, FIELD_IDS, NEW_MEMBER } from './MemberModal.data'
import { FOOTER, FORM } from './MemberModal.styles'

/**
 * "Agregar integrante" (PAGE-1): the email of someone already registered and their role in this
 * project. Mount it only while it is open (see Team.jsx), so every opening starts clean.
 *
 * `onSubmit({ email, role })` returns the request's promise: the sheet only closes once it
 * resolves (FIX-1). The API's "no such user" and "already a member" go under the email field,
 * where the problem is; anything else above the buttons.
 */
export function MemberModal({ members, onClose, onSubmit }) {
  const [values, setValues] = useState(NEW_MEMBER)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const takenEmails = members.map((member) => member.email.toLowerCase())

  function setField(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    if (errors[name]) setErrors({ ...errors, [name]: validateMemberForm(nextValues, takenEmails)[name] })
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateMemberForm(values, takenEmails)
    setErrors(found)
    if (found.email) {
      document.getElementById(FIELD_IDS.email)?.focus()
      return
    }
    if (found.role) return

    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit({ email: values.email.trim().toLowerCase(), role: values.role })
      onClose()
    } catch (err) {
      const emailError = EMAIL_ERRORS[err?.message]
      if (emailError) {
        setErrors({ email: emailError })
        document.getElementById(FIELD_IDS.email)?.focus()
      } else {
        setFormError(errorMessage(err))
      }
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={handleClose} title="Agregar integrante">
      <form onSubmit={handleSubmit} className={FORM} noValidate>
        <TextField
          id={FIELD_IDS.email}
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="nombre@empresa.com"
          autoComplete="off"
          value={values.email}
          disabled={submitting}
          error={errors.email}
          onChange={(e) => setField('email', e.target.value)}
        />
        <p className="-mt-2 text-footnote text-label-secondary">
          Tiene que tener una cuenta en Req2Ticket.
        </p>

        <RolePicker
          value={values.role}
          disabled={submitting}
          error={errors.role}
          onChange={(role) => setField('role', role)}
        />

        {formError && <FormError>{formError}</FormError>}

        <div className={FOOTER}>
          <Button variant="neutral" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Agregando…' : 'Agregar al equipo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
