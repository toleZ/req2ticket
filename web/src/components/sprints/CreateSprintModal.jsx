import { useState } from 'react'
import { Calendar, Flag, Gauge, Tag } from 'lucide-react'

import { Modal } from '@/components/ui/Modal'
import { errorMessage } from '@/lib/errors'
import { SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { validateSprintForm } from '@/lib/validate'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
const INITIAL_VALUES = {
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  capacity: '',
  status: 'planned',
}

const FORM_ERROR = 'rounded-control bg-red/12 px-3 py-2 text-footnote text-red'

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
   "submit", y sin él el botón crea el sprint en vez de cerrar. */
const CANCEL_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast
  ease-out-quad hover:bg-fill-tertiary hover:text-label disabled:opacity-50`

const SUBMIT_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

export function CreateSprintModal({ isOpen, onClose, onCreate }) {
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
      setErrors({ ...errors, [e.target.name]: validateSprintForm(nextValues)[e.target.name] })
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
    const found = validateSprintForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onCreate({ ...values, name: values.name.trim(), goal: values.goal.trim() })
      // The modal only closes once the sprint was created: if the POST fails, what was
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo sprint">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && (
          <p className={FORM_ERROR} role="alert">
            {formError}
          </p>
        )}

        {/* Los aria del control tienen que apuntar al id EXACTO del <p> del error: si no
            coinciden, el lector de pantalla no lo lee y nada falla a la vista. */}
        <div>
          <label htmlFor="sprint-name" className={LABEL}>
            Nombre
          </label>
          <div className="relative">
            <span className={ICON_WRAP} aria-hidden="true">
              <Tag className="size-4" />
            </span>
            <input
              id="sprint-name"
              name="name"
              placeholder="Sprint 8"
              value={values.name}
              disabled={submitting}
              onChange={handleChange}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'sprint-name-error' : undefined}
              className={CONTROL_ICON}
            />
          </div>
          {errors.name && (
            <p id="sprint-name-error" className={FIELD_ERROR}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sprint-goal" className={LABEL}>
            Meta <span className={OPTIONAL}>(opcional)</span>
          </label>
          <textarea
            id="sprint-goal"
            name="goal"
            rows={2}
            placeholder="Qué queremos haber terminado cuando cierre"
            value={values.goal}
            disabled={submitting}
            onChange={handleChange}
            className={CONTROL_TEXTAREA}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sprint-start" className={LABEL}>
              Fecha de inicio
            </label>
            <div className="relative">
              <span className={ICON_WRAP} aria-hidden="true">
                <Calendar className="size-4" />
              </span>
              <input
                id="sprint-start"
                name="startDate"
                type="date"
                value={values.startDate}
                disabled={submitting}
                onChange={handleChange}
                aria-invalid={errors.startDate ? true : undefined}
                aria-describedby={errors.startDate ? 'sprint-start-error' : undefined}
                className={CONTROL_ICON}
              />
            </div>
            {errors.startDate && (
              <p id="sprint-start-error" className={FIELD_ERROR}>
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sprint-end" className={LABEL}>
              Fecha de fin
            </label>
            <div className="relative">
              <span className={ICON_WRAP} aria-hidden="true">
                <Calendar className="size-4" />
              </span>
              <input
                id="sprint-end"
                name="endDate"
                type="date"
                value={values.endDate}
                disabled={submitting}
                onChange={handleChange}
                aria-invalid={errors.endDate ? true : undefined}
                aria-describedby={errors.endDate ? 'sprint-end-error' : undefined}
                className={CONTROL_ICON}
              />
            </div>
            {errors.endDate && (
              <p id="sprint-end-error" className={FIELD_ERROR}>
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sprint-capacity" className={LABEL}>
              Capacidad
            </label>
            <div className="relative">
              <span className={ICON_WRAP} aria-hidden="true">
                <Gauge className="size-4" />
              </span>
              <input
                id="sprint-capacity"
                name="capacity"
                type="number"
                min="0"
                placeholder="Puntos"
                value={values.capacity}
                disabled={submitting}
                onChange={handleChange}
                aria-invalid={errors.capacity ? true : undefined}
                aria-describedby={errors.capacity ? 'sprint-capacity-error' : undefined}
                className={CONTROL_ICON}
              />
            </div>
            {errors.capacity && (
              <p id="sprint-capacity-error" className={FIELD_ERROR}>
                {errors.capacity}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sprint-status" className={LABEL}>
              Estado
            </label>
            <select
              id="sprint-status"
              name="status"
              value={values.status}
              disabled={submitting}
              onChange={handleChange}
              className={CONTROL}
            >
              {SPRINT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            <Flag className="size-4" aria-hidden="true" />
            {submitting ? 'Creando…' : 'Crear sprint'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
