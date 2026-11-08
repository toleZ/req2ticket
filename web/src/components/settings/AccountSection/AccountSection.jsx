import { useState } from 'react'

import { Button } from '@/components/ui/Button/Button'
import { PasswordField } from '@/components/ui/Field/PasswordField'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { toast } from '@/components/ui/Toast/toast'
import { errorMessage } from '@/lib/errors'
import { useChangePassword, useUpdateMe } from '@/lib/queries/account'
import { newPasswordError } from '@/lib/validate'
import { ACTIONS, FORM, ROW_LABEL, SECTION, SECTION_INTRO, SECTION_TITLE } from '../Settings.styles'

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' }

function validateName(name) {
  const trimmed = name.trim()
  if (!trimmed) return 'Ingresá tu nombre'
  if (trimmed.length < 2 || trimmed.length > 80) return 'El nombre tiene que tener entre 2 y 80 caracteres'
  return undefined
}

function validatePasswords(values) {
  const errors = {}
  if (!values.currentPassword) errors.currentPassword = 'Ingresá tu contraseña actual'
  const newError = newPasswordError(values.newPassword, 'Ingresá la contraseña nueva')
  if (newError) errors.newPassword = newError
  else if (values.newPassword === values.currentPassword) errors.newPassword = 'Tiene que ser distinta de la actual'
  if (!newError && values.confirmPassword !== values.newPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
  return errors
}

/**
 * Mi cuenta (PAGE-2): your name and your password. The email is shown but not editable — it is
 * how people add you to their projects. Two separate forms, so changing one never sends the other.
 *
 * `user` is who you are ({ name, email }); mount with `key={user.id}`.
 */
export function AccountSection({ user }) {
  const [name, setName] = useState(user.name)
  const [nameError, setNameError] = useState('')
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordFormError, setPasswordFormError] = useState('')
  const updateMe = useUpdateMe()
  const changePassword = useChangePassword()

  async function handleNameSubmit(e) {
    e.preventDefault()
    const error = validateName(name)
    setNameError(error ?? '')
    if (error) return

    try {
      await updateMe.mutateAsync({ name })
      toast.success('Nombre actualizado')
    } catch (err) {
      setNameError(errorMessage(err))
    }
  }

  function handlePasswordChange(e) {
    const next = { ...passwords, [e.target.name]: e.target.value }
    setPasswords(next)
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: validatePasswords(next)[e.target.name] })
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    const found = validatePasswords(passwords)
    setPasswordErrors(found)
    if (Object.keys(found).length > 0) return

    setPasswordFormError('')
    try {
      await changePassword.mutateAsync({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords(EMPTY_PASSWORDS)
      toast.success('Contraseña cambiada')
    } catch (err) {
      // The API's two answers that belong to a field go under it; anything else above the form.
      if (err?.message === 'Current password is incorrect.') {
        setPasswordErrors({ currentPassword: 'La contraseña actual no es correcta' })
      } else if (/different from the current/i.test(err?.message ?? '')) {
        setPasswordErrors({ newPassword: 'Tiene que ser distinta de la actual' })
      } else if (err?.fieldErrors?.newPassword) {
        setPasswordErrors({ newPassword: 'La contraseña no cumple las reglas de abajo' })
      } else {
        setPasswordFormError(errorMessage(err))
      }
    }
  }

  const savingName = updateMe.isPending
  const savingPassword = changePassword.isPending

  return (
    <>
      <section className={SECTION} aria-labelledby="settings-account">
        <h2 id="settings-account" className={SECTION_TITLE}>
          Tus datos
        </h2>
        <p className={SECTION_INTRO}>Los mismos en todos tus proyectos.</p>

        <form onSubmit={handleNameSubmit} noValidate className={FORM}>
          <TextField
            id="account-name"
            name="name"
            label="Nombre"
            autoComplete="name"
            value={name}
            disabled={savingName}
            error={nameError}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <p className={ROW_LABEL}>Email</p>
            <ReadOnlyValue variant="field">{user.email}</ReadOnlyValue>
          </div>
          <div className={ACTIONS}>
            <Button type="submit" disabled={savingName || name.trim() === user.name}>
              {savingName ? 'Guardando…' : 'Guardar nombre'}
            </Button>
          </div>
        </form>
      </section>

      <section className={SECTION} aria-labelledby="settings-password">
        <h2 id="settings-password" className={SECTION_TITLE}>
          Contraseña
        </h2>
        <form onSubmit={handlePasswordSubmit} noValidate className={FORM}>
          {passwordFormError && <FormError>{passwordFormError}</FormError>}
          <PasswordField
            id="account-current-password"
            name="currentPassword"
            label="Contraseña actual"
            autoComplete="current-password"
            value={passwords.currentPassword}
            disabled={savingPassword}
            error={passwordErrors.currentPassword}
            onChange={handlePasswordChange}
          />
          <PasswordField
            id="account-new-password"
            name="newPassword"
            label="Contraseña nueva"
            autoComplete="new-password"
            value={passwords.newPassword}
            showRules
            disabled={savingPassword}
            error={passwordErrors.newPassword}
            onChange={handlePasswordChange}
          />
          <PasswordField
            id="account-confirm-password"
            name="confirmPassword"
            label="Repetí la contraseña nueva"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            disabled={savingPassword}
            error={passwordErrors.confirmPassword}
            onChange={handlePasswordChange}
          />
          <div className={ACTIONS}>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Cambiando…' : 'Cambiar contraseña'}
            </Button>
          </div>
        </form>
      </section>
    </>
  )
}
