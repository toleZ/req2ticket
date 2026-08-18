import { useCallback, useState } from 'react'

import { Modal } from '@/components/ui/Modal'
import { SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { validateSprintForm } from '@/lib/validate'

const INITIAL_VALUES = {
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  capacity: '',
  status: 'planned',
}

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label'

const LABEL_CLASSES = 'mb-1 block text-subheadline font-medium text-label'

export function CreateSprintModal({ isOpen, onClose, onCreate }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const set = (field) => (e) => {
    const nextValues = { ...values, [field]: e.target.value }
    setValues(nextValues)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateSprintForm(nextValues)[field] }))
    }
  }

  const handleClose = useCallback(() => {
    setValues(INITIAL_VALUES)
    setErrors({})
    setFormError('')
    onClose()
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateSprintForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onCreate({
        ...values,
        name: values.name.trim(),
        goal: values.goal.trim(),
      })
      // El modal se cierra solo si el sprint se creó: si el POST falla, lo cargado
      // sigue en pantalla y el error se muestra arriba.
      handleClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo sprint">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && (
          <p
            className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red"
            role="alert"
          >
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="sprint-name" className={LABEL_CLASSES}>
            Nombre
          </label>
          <input
            id="sprint-name"
            value={values.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'sprint-name-error' : undefined}
            className={INPUT_CLASSES}
          />
          {errors.name && (
            <p id="sprint-name-error" className="mt-1 text-footnote text-red">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sprint-goal" className={LABEL_CLASSES}>
            Meta <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <textarea
            id="sprint-goal"
            rows={2}
            value={values.goal}
            onChange={set('goal')}
            className={`${INPUT_CLASSES} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sprint-start-date" className={LABEL_CLASSES}>
              Fecha de inicio
            </label>
            <input
              id="sprint-start-date"
              type="date"
              value={values.startDate}
              onChange={set('startDate')}
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={errors.startDate ? 'sprint-start-date-error' : undefined}
              className={INPUT_CLASSES}
            />
            {errors.startDate && (
              <p id="sprint-start-date-error" className="mt-1 text-footnote text-red">
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sprint-end-date" className={LABEL_CLASSES}>
              Fecha de fin
            </label>
            <input
              id="sprint-end-date"
              type="date"
              value={values.endDate}
              onChange={set('endDate')}
              aria-invalid={Boolean(errors.endDate)}
              aria-describedby={errors.endDate ? 'sprint-end-date-error' : undefined}
              className={INPUT_CLASSES}
            />
            {errors.endDate && (
              <p id="sprint-end-date-error" className="mt-1 text-footnote text-red">
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sprint-capacity" className={LABEL_CLASSES}>
              Capacidad <span className="font-normal text-label-tertiary">(puntos)</span>
            </label>
            <input
              id="sprint-capacity"
              type="number"
              min="0"
              value={values.capacity}
              onChange={set('capacity')}
              aria-invalid={Boolean(errors.capacity)}
              aria-describedby={errors.capacity ? 'sprint-capacity-error' : undefined}
              className={INPUT_CLASSES}
            />
            {errors.capacity && (
              <p id="sprint-capacity-error" className="mt-1 text-footnote text-red">
                {errors.capacity}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sprint-status" className={LABEL_CLASSES}>
              Estado
            </label>
            <select
              id="sprint-status"
              value={values.status}
              onChange={set('status')}
              className={INPUT_CLASSES}
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
            className="rounded-control px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast hover:bg-fill-tertiary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-control bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? 'Creando…' : 'Crear sprint'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
