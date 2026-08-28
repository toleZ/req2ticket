import { useEffect, useState } from 'react'
import { Layers } from 'lucide-react'

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

const FORM_ERROR = 'rounded-control bg-red/12 px-3 py-2 text-footnote text-red'

const SWATCH = 'size-7 shrink-0 rounded-full transition-transform duration-fast'

const LABEL = 'mb-1 block text-subheadline font-medium text-label'

const OPTIONAL = 'font-normal text-label-tertiary'

const FIELD_ERROR = 'mt-1 text-footnote text-red'

const CONTROL = `w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2
  text-body text-label transition-colors duration-fast placeholder:text-label-tertiary
  hover:border-separator-opaque disabled:opacity-50`

const ICON_WRAP = 'pointer-events-none absolute inset-y-0 left-3 flex items-center text-label-tertiary'

/* El icono va adentro del input; `pl-9` le hace lugar. */
const CONTROL_ICON = `${CONTROL} pl-9`

const CONTROL_TEXTAREA = `${CONTROL} resize-none`

/* `type="button"` en Cancelar no es opcional: el default adentro de un <form> es
   "submit", y sin él el botón crea la épica en vez de cerrar. */
const CANCEL_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast
  ease-out-quad hover:bg-fill-tertiary hover:text-label disabled:opacity-50`

const SUBMIT_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

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
        {formError && (
          <p className={FORM_ERROR} role="alert">
            {formError}
          </p>
        )}

        {/* Los aria del control tienen que apuntar al id EXACTO del <p> del error: si no
            coinciden, el lector de pantalla no lo lee y nada falla a la vista. */}
        <div>
          <label htmlFor="epic-name" className={LABEL}>
            Nombre
          </label>
          <div className="relative">
            <span className={ICON_WRAP} aria-hidden="true">
              <Layers className="size-4" />
            </span>
            <input
              id="epic-name"
              name="name"
              placeholder="Autenticación y acceso"
              value={values.name}
              disabled={submitting}
              onChange={handleChange}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'epic-name-error' : undefined}
              className={CONTROL_ICON}
            />
          </div>
          {errors.name && (
            <p id="epic-name-error" className={FIELD_ERROR}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="epic-description" className={LABEL}>
            Descripción <span className={OPTIONAL}>(opcional)</span>
          </label>
          <textarea
            id="epic-description"
            name="description"
            rows={2}
            value={values.description}
            disabled={submitting}
            onChange={handleChange}
            className={CONTROL_TEXTAREA}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="epic-priority" className={LABEL}>
              Prioridad
            </label>
            <select
              id="epic-priority"
              name="priority"
              value={values.priority}
              disabled={submitting}
              onChange={handleChange}
              className={CONTROL}
            >
              {EPIC_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="epic-status" className={LABEL}>
              Estado
            </label>
            <select
              id="epic-status"
              name="status"
              value={values.status}
              disabled={submitting}
              onChange={handleChange}
              className={CONTROL}
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
          <label htmlFor="epic-owner" className={LABEL}>
            Responsable <span className={OPTIONAL}>(opcional)</span>
          </label>
          <select
            id="epic-owner"
            name="ownerId"
            value={values.ownerId}
            disabled={submitting}
            onChange={handleChange}
            className={CONTROL}
          >
            <option value="">Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* No es un campo de texto: son botones que pintan un color, así que no hay <input>
            ni pasa por handleChange. Un <p> y no un <label> porque no hay un único control al
            que apuntar — el nombre del grupo lo pone el aria-label. */}
        <div>
          <p className={LABEL}>Color</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color de acento">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                role="radio"
                aria-checked={values.accentColor === color.value}
                aria-label={color.value}
                disabled={submitting}
                onClick={() => setValues({ ...values, accentColor: color.value })}
                className={cn(
                  SWATCH,
                  color.dotClass,
                  values.accentColor === color.value &&
                    'scale-110 ring-2 ring-label ring-offset-2 ring-offset-elevated',
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className={CANCEL_BUTTON}
          >
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className={SUBMIT_BUTTON}>
            <Layers className="size-4" aria-hidden="true" />
            {submitting ? 'Creando…' : 'Crear épica'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
