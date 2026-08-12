import { useCallback, useEffect, useState } from 'react'

import { Modal } from '@/components/ui/Modal'
import { getUsers } from '@/lib/api'
import { ACCENT_COLORS, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/lib/epicOptions'
import { validateEpicForm } from '@/lib/validate'

const INITIAL_VALUES = {
  name: '',
  description: '',
  accentColor: 'blue',
  priority: 'medium',
  status: 'backlog',
  ownerId: '',
}

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label'

const LABEL_CLASSES = 'mb-1 block text-subheadline font-medium text-label'

export function CreateEpicModal({ isOpen, onClose, onCreate }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [users, setUsers] = useState([])

  // Los responsables salen de la API. Si falla, el select queda vacío y la épica se
  // puede crear igual sin asignar a nadie.
  useEffect(() => {
    if (!isOpen) return

    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [isOpen])

  const set = (field) => (e) => {
    const nextValues = { ...values, [field]: e.target.value }
    setValues(nextValues)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateEpicForm(nextValues)[field] }))
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
      // El modal se cierra solo si la épica se creó: si el POST falla, lo cargado
      // sigue en pantalla y el error se muestra arriba.
      handleClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva épica">
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
          <label htmlFor="epic-name" className={LABEL_CLASSES}>
            Nombre
          </label>
          <input
            id="epic-name"
            value={values.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'epic-name-error' : undefined}
            className={INPUT_CLASSES}
          />
          {errors.name && (
            <p id="epic-name-error" className="mt-1 text-footnote text-red">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="epic-description" className={LABEL_CLASSES}>
            Descripción <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <textarea
            id="epic-description"
            rows={2}
            value={values.description}
            onChange={set('description')}
            className={`${INPUT_CLASSES} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="epic-priority" className={LABEL_CLASSES}>
              Prioridad
            </label>
            <select
              id="epic-priority"
              value={values.priority}
              onChange={set('priority')}
              className={INPUT_CLASSES}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="epic-status" className={LABEL_CLASSES}>
              Estado
            </label>
            <select
              id="epic-status"
              value={values.status}
              onChange={set('status')}
              className={INPUT_CLASSES}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="epic-owner" className={LABEL_CLASSES}>
            Responsable <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <select
            id="epic-owner"
            value={values.ownerId}
            onChange={set('ownerId')}
            className={INPUT_CLASSES}
          >
            <option value="">Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={LABEL_CLASSES}>Color</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color de acento">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                role="radio"
                aria-checked={values.accentColor === color.value}
                aria-label={color.value}
                onClick={() => setValues((v) => ({ ...v, accentColor: color.value }))}
                className={`size-7 shrink-0 rounded-full transition-transform duration-fast ${color.dotClass} ${
                  values.accentColor === color.value
                    ? 'scale-110 ring-2 ring-label ring-offset-2 ring-offset-elevated'
                    : ''
                }`}
              />
            ))}
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
            {submitting ? 'Creando…' : 'Crear épica'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
