import { useState } from 'react'

import { RolePicker } from '@/components/team/RolePicker/RolePicker'
import { Button } from '@/components/ui/Button/Button'
import { PasswordField } from '@/components/ui/Field/PasswordField'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { errorMessage } from '@/lib/errors'
import { validateMemberForm } from '@/lib/validate'
import { FIELD_IDS, NEW_MEMBER } from './MemberModal.data'
import { FOOTER, FORM } from './MemberModal.styles'

/**
 * Adding someone to the team, or editing them: same four fields, so one sheet. With `member`
 * it edits, and then the password is optional — empty leaves it as it is.
 *
 * Mount it only while it is open (see Team.jsx): the form seeds itself once, from `member`, so
 * every opening starts clean without a reset.
 *
 * `onSubmit` gets the values already tidied (trimmed, email in lowercase) and has to return the
 * request's promise: the sheet only closes once it resolves, and if it fails what was typed
 * stays on screen with the error above the buttons.
 */
export function MemberModal({ member, me, members, onClose, onSubmit }) {
  const isNew = !member
  const isMe = member?.id === me.id

  const [values, setValues] = useState(
    isNew ? NEW_MEMBER : { name: member.name, email: member.email, password: '', role: member.role },
  )
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const takenEmails = members.filter((other) => other.id !== member?.id).map((other) => other.email.toLowerCase())

  function setField(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)

    // A field that already shows an error is re-checked as you type, so the message goes away
    // the moment it is fixed. The others wait for the submit.
    if (errors[name]) {
      setErrors({ ...errors, [name]: validateMemberForm(nextValues, isNew, takenEmails)[name] })
    }
  }

  function handleChange(e) {
    setField(e.target.name, e.target.value)
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateMemberForm(values, isNew, takenEmails)
    setErrors(found)
    const firstInvalid = Object.keys(found).find((key) => found[key])
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit({
        name: values.name.replace(/\s+/g, ' ').trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role,
      })
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
      setSubmitting(false)
    }
  }

  let submitLabel = isNew ? 'Agregar al equipo' : 'Guardar cambios'
  if (submitting) submitLabel = isNew ? 'Agregando…' : 'Guardando…'

  return (
    <Modal isOpen onClose={handleClose} title={isNew ? 'Nuevo integrante' : 'Editar integrante'}>
      <form onSubmit={handleSubmit} className={FORM} noValidate>
        <TextField
          id={FIELD_IDS.name}
          name="name"
          label="Nombre"
          placeholder="Nombre y apellido"
          autoComplete="off"
          value={values.name}
          disabled={submitting}
          error={errors.name}
          onChange={handleChange}
        />

        <TextField
          id={FIELD_IDS.email}
          name="email"
          type="email"
          label="Email"
          placeholder="nombre@empresa.com"
          autoComplete="off"
          value={values.email}
          disabled={submitting}
          error={errors.email}
          onChange={handleChange}
        />

        <PasswordField
          id={FIELD_IDS.password}
          name="password"
          label={isNew ? 'Contraseña' : 'Nueva contraseña'}
          autoComplete="new-password"
          placeholder={isNew ? 'Mínimo 8 caracteres' : 'Dejala vacía para no cambiarla'}
          value={values.password}
          disabled={submitting}
          error={errors.password}
          onChange={handleChange}
        />

        <RolePicker
          value={values.role}
          actorRole={me.role}
          disabled={submitting}
          lockedReason={isMe ? 'No podés cambiar tu propio rol.' : undefined}
          onChange={(role) => setField('role', role)}
        />

        {formError && <FormError>{formError}</FormError>}

        <div className={FOOTER}>
          <Button variant="neutral" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
