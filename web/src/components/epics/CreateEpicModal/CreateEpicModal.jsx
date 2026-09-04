import { useEffect, useState } from 'react'
import { Layers } from 'lucide-react'

import { AccentColorPicker } from '@/components/epics/AccentColorPicker/AccentColorPicker'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/Field/SelectField'
import { TextAreaField } from '@/components/ui/Field/TextAreaField'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { getUsers } from '@/lib/api'
import { EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { errorMessage } from '@/lib/errors'
import { validateEpicForm } from '@/lib/validate'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
const INITIAL_VALUES = {
  name: '',
  description: '',
  accentColor: 'blue',
  priority: 'medium',
  status: 'backlog',
  ownerId: '',
}

const LABEL = 'mb-1 block text-subheadline font-medium text-label'

export function CreateEpicModal({ isOpen, onClose, onCreate }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [users, setUsers] = useState([])

  // The owners come from the API. If it fails the select stays empty and the epic can
  // still be created without assigning anyone.
  useEffect(() => {
    if (!isOpen) return

    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [isOpen])

  function handleChange(e) {
    const nextValues = { ...values, [e.target.name]: e.target.value }
    setValues(nextValues)

    // If the field already had an error, it is re-checked as you type so the message
    // disappears as soon as you fix it. A field with no error yet is not validated until
    // submit.
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: validateEpicForm(nextValues)[e.target.name] })
    }
  }

  function handleClose() {
    if (submitting) return

    setValues(INITIAL_VALUES)
    setErrors({})
    setFormError('')
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateEpicForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onCreate({
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
      })
      // The modal only closes once the epic was created: if the POST fails, what was typed
      // stays on screen and the error is shown above.
      setValues(INITIAL_VALUES)
      setErrors({})
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva épica">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && <FormError>{formError}</FormError>}

        <TextField
          id="epic-name"
          name="name"
          label="Nombre"
          icon={Layers}
          placeholder="Autenticación y acceso"
          value={values.name}
          disabled={submitting}
          error={errors.name}
          onChange={handleChange}
        />

        <TextAreaField
          id="epic-description"
          name="description"
          label="Descripción"
          optional
          value={values.description}
          disabled={submitting}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            id="epic-priority"
            name="priority"
            label="Prioridad"
            value={values.priority}
            disabled={submitting}
            onChange={handleChange}
          >
            {EPIC_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="epic-status"
            name="status"
            label="Estado"
            value={values.status}
            disabled={submitting}
            onChange={handleChange}
          >
            {EPIC_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <SelectField
          id="epic-owner"
          name="ownerId"
          label="Responsable"
          optional
          value={values.ownerId}
          disabled={submitting}
          onChange={handleChange}
        >
          <option value="">Sin asignar</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </SelectField>

        {/* A <p> and not a <label> because there is no single control to point at — the
            group's name comes from the picker's own aria-label. */}
        <div>
          <p className={LABEL}>Color</p>
          <AccentColorPicker
            value={values.accentColor}
            disabled={submitting}
            onChange={(accentColor) => setValues({ ...values, accentColor })}
          />
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            <Layers className="size-4" aria-hidden="true" />
            {submitting ? 'Creando…' : 'Crear épica'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
