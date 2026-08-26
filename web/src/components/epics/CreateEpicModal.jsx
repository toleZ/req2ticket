import { useEffect, useState } from 'react'

import { Modal } from '@/components/ui/Modal'
import { getUsers } from '@/lib/api'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
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
      // The modal only closes once the epic was created: if the POST fails, what was
      // typed stays on screen and the error is shown above.
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
        {formError && (
          <p className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red" role="alert">
            {formError}
          </p>
        )}

        {/* Each field is one <div>: the form is `flex flex-col gap-4`, so label + input +
            error as loose siblings would pick up two extra gaps. */}
        <div>
          <label htmlFor="epic-name" className="mb-1 block text-subheadline font-medium text-label">
            Nombre
          </label>
          <input
            id="epic-name"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'epic-name-error' : undefined}
            className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
          />
          {errors.name && (
            <p id="epic-name-error" className="mt-1 text-footnote text-red">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="epic-description" className="mb-1 block text-subheadline font-medium text-label">
            Descripción <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <textarea
            id="epic-description"
            rows={2}
            name="description"
            value={values.description}
            onChange={handleChange}
            className="w-full resize-none rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="epic-priority" className="mb-1 block text-subheadline font-medium text-label">
              Prioridad
            </label>
            <select
              id="epic-priority"
              name="priority"
              value={values.priority}
              onChange={handleChange}
              className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
            >
              {EPIC_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="epic-status" className="mb-1 block text-subheadline font-medium text-label">
              Estado
            </label>
            <select
              id="epic-status"
              name="status"
              value={values.status}
              onChange={handleChange}
              className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
            >
              {EPIC_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="epic-owner" className="mb-1 block text-subheadline font-medium text-label">
            Responsable <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <select
            id="epic-owner"
            name="ownerId"
            value={values.ownerId}
            onChange={handleChange}
            className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
          >
            <option value="">Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Not a text field: these are buttons that paint a colour, so it neither uses
            TextField nor goes through handleChange. */}
        <div>
          {/* A <p>, not a <label>: there is no single control to point at. The group's
              accessible name comes from the radiogroup's aria-label below. */}
          <p className="mb-1 block text-subheadline font-medium text-label">Color</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color de acento">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                role="radio"
                aria-checked={values.accentColor === color.value}
                aria-label={color.value}
                onClick={() => setValues({ ...values, accentColor: color.value })}
                className={cn(
                  'size-7 shrink-0 rounded-full transition-transform duration-fast',
                  color.dotClass,
                  values.accentColor === color.value &&
                    'scale-110 ring-2 ring-label ring-offset-2 ring-offset-elevated',
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-1 flex justify-end gap-2">
          {/* type="button" is not optional: inside a <form> the browser default is
              "submit", so without it Cancelar would create the record. */}
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-control px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast hover:bg-fill-tertiary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-control bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast hover:brightness-110 disabled:opacity-50">
            {submitting ? 'Creando…' : 'Crear épica'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
