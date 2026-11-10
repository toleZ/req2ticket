import { useState } from 'react'
import { Mail, User } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { PasswordField } from '@/components/ui/Field/PasswordField'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { SegmentedField } from '@/components/ui/SegmentedField/SegmentedField'
import { SheetField } from '@/components/ui/SheetField/SheetField'
import { errorMessage } from '@/lib/errors'
import { PLATFORM_ROLE_OPTIONS } from '@/lib/options'
import { validateUserForm } from '@/lib/validate'

/**
 * Creating or editing a user of the platform (Administración, SuperAdmin only). `user` is the
 * one being edited, or null to create one. Mount it only while it is open, so every opening
 * starts from the user as it is.
 *
 * Creating asks for a password, with the same rules as the registration. Editing leaves it
 * empty: empty keeps the current one, anything typed replaces it (a reset, for someone who
 * forgot theirs). Your own platform role is locked: giving it up is a mistake with no way back.
 *
 *   onSubmit(values)   returns the request's promise; the sheet closes once it resolves
 */
export function UserFormModal({ user, isMe, onClose, onSubmit }) {
  const isEditing = user !== null
  const [values, setValues] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    platformRole: user?.platformRole ?? 'user',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function setField(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    if (errors[name]) setErrors({ ...errors, [name]: validateUserForm(nextValues, isEditing)[name] })
  }

  function handleClose() {
    if (!submitting) onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateUserForm(values, isEditing)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={handleClose} title={isEditing ? `Editar a ${user.name}` : 'Crear usuario'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          id="user-name"
          name="name"
          label="Nombre"
          icon={User}
          autoComplete="off"
          value={values.name}
          disabled={submitting}
          error={errors.name}
          onChange={(e) => setField('name', e.target.value)}
        />
        <TextField
          id="user-email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="off"
          value={values.email}
          disabled={submitting}
          error={errors.email}
          onChange={(e) => setField('email', e.target.value)}
        />
        <PasswordField
          id="user-password"
          name="password"
          label={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          autoComplete="new-password"
          value={values.password}
          disabled={submitting}
          error={errors.password}
          showRules={!isEditing || values.password.length > 0}
          onChange={(e) => setField('password', e.target.value)}
        />

        <SheetField label="Rol en la plataforma">
          <SegmentedField
            name="user-platform-role"
            legend="Rol en la plataforma"
            options={PLATFORM_ROLE_OPTIONS}
            value={values.platformRole}
            disabled={submitting || isMe}
            onChange={(platformRole) => setField('platformRole', platformRole)}
          />
          {isMe && <p className="mt-1 text-caption text-label-secondary">No podés cambiar tu propio rol.</p>}
        </SheetField>

        {formError && <FormError>{formError}</FormError>}

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="neutral" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
