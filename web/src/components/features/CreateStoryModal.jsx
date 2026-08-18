import { useEffect, useState, useCallback } from 'react'

import { Modal } from '@/components/ui/Modal'
import { getUsers } from '@/lib/api'
import { STORY_PRIORITY_OPTIONS, STORY_STATUS_OPTIONS } from '@/lib/storyOptions'
import { validateStoryForm } from '@/lib/validate'

const INITIAL_VALUES = {
  title: '',
  description: '',
  epicId: '',
  priority: 'medium',
  status: 'todo',
  points: '',
  assigneeId: '',
  sprintId: '',
  criteriaTotal: '',
}

const INPUT_CLASSES =
  'w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label'

const LABEL_CLASSES = 'mb-1 block text-subheadline font-medium text-label'

export function CreateStoryModal({ isOpen, onClose, onCreate, epics, sprints }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [users, setUsers] = useState([])

  // Los responsables salen de la API. Si falla, el select queda vacío y la historia
  // se puede crear igual sin asignar a nadie.
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
      setErrors((prev) => ({ ...prev, [field]: validateStoryForm(nextValues)[field] }))
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
    const found = validateStoryForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onCreate({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      })
      // El modal se cierra solo si la historia se creó: si el POST falla, lo cargado
      // sigue en pantalla y el error se muestra arriba.
      handleClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva historia">
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
          <label htmlFor="story-title" className={LABEL_CLASSES}>
            Título
          </label>
          <input
            id="story-title"
            value={values.title}
            onChange={set('title')}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'story-title-error' : undefined}
            className={INPUT_CLASSES}
          />
          {errors.title && (
            <p id="story-title-error" className="mt-1 text-footnote text-red">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="story-description" className={LABEL_CLASSES}>
            Descripción <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <textarea
            id="story-description"
            rows={2}
            value={values.description}
            onChange={set('description')}
            className={`${INPUT_CLASSES} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="story-epic" className={LABEL_CLASSES}>
            Funcionalidad
          </label>
          <select
            id="story-epic"
            value={values.epicId}
            onChange={set('epicId')}
            aria-invalid={Boolean(errors.epicId)}
            aria-describedby={errors.epicId ? 'story-epic-error' : undefined}
            className={INPUT_CLASSES}
          >
            <option value="">Elegí una funcionalidad</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.name}
              </option>
            ))}
          </select>
          {errors.epicId && (
            <p id="story-epic-error" className="mt-1 text-footnote text-red">
              {errors.epicId}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="story-priority" className={LABEL_CLASSES}>
              Prioridad
            </label>
            <select
              id="story-priority"
              value={values.priority}
              onChange={set('priority')}
              className={INPUT_CLASSES}
            >
              {STORY_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="story-status" className={LABEL_CLASSES}>
              Estado
            </label>
            <select
              id="story-status"
              value={values.status}
              onChange={set('status')}
              className={INPUT_CLASSES}
            >
              {STORY_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="story-points" className={LABEL_CLASSES}>
              Puntos
            </label>
            <input
              id="story-points"
              type="number"
              min="0"
              value={values.points}
              onChange={set('points')}
              className={INPUT_CLASSES}
            />
          </div>

          <div>
            <label htmlFor="story-criteria" className={LABEL_CLASSES}>
              Criterios de aceptación
            </label>
            <input
              id="story-criteria"
              type="number"
              min="0"
              value={values.criteriaTotal}
              onChange={set('criteriaTotal')}
              className={INPUT_CLASSES}
            />
          </div>
        </div>

        <div>
          <label htmlFor="story-assignee" className={LABEL_CLASSES}>
            Responsable <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <select
            id="story-assignee"
            value={values.assigneeId}
            onChange={set('assigneeId')}
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
          <label htmlFor="story-sprint" className={LABEL_CLASSES}>
            Sprint <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <select
            id="story-sprint"
            value={values.sprintId}
            onChange={set('sprintId')}
            className={INPUT_CLASSES}
          >
            <option value="">Sin sprint (backlog)</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
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
            {submitting ? 'Creando…' : 'Crear historia'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
