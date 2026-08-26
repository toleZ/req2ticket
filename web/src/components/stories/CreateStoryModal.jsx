import { useEffect, useState } from 'react'

import { Modal } from '@/components/ui/Modal'
import { getUsers } from '@/lib/api'
import { errorMessage } from '@/lib/errors'
import { STORY_PRIORITY_OPTIONS, STORY_STATUS_OPTIONS } from '@/lib/storyOptions'
import { validateStoryForm } from '@/lib/validate'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
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

export function CreateStoryModal({ isOpen, onClose, onCreate, epics, sprints }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [users, setUsers] = useState([])

  // The assignees come from the API. If it fails the select stays empty and the story can
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
      setErrors({ ...errors, [e.target.name]: validateStoryForm(nextValues)[e.target.name] })
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
      // The modal only closes once the story was created: if the POST fails, what was
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva historia">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && (
          <p className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red" role="alert">
            {formError}
          </p>
        )}

        {/* Each field is one <div>: the form is `flex flex-col gap-4`, so label + input +
            error as loose siblings would pick up two extra gaps. */}
        <div>
          <label htmlFor="story-title" className="mb-1 block text-subheadline font-medium text-label">
            Título
          </label>
          <input
            id="story-title"
            type="text"
            name="title"
            value={values.title}
            onChange={handleChange}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'story-title-error' : undefined}
            className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
          />
          {errors.title && (
            <p id="story-title-error" className="mt-1 text-footnote text-red">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="story-description" className="mb-1 block text-subheadline font-medium text-label">
            Descripción <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <textarea
            id="story-description"
            rows={2}
            name="description"
            value={values.description}
            onChange={handleChange}
            className="w-full resize-none rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="story-epic" className="mb-1 block text-subheadline font-medium text-label">
            Épica
          </label>
          <select
            id="story-epic"
            name="epicId"
            value={values.epicId}
            onChange={handleChange}
            aria-invalid={errors.epicId ? true : undefined}
            aria-describedby={errors.epicId ? 'story-epic-error' : undefined}
            className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
          >
            <option value="">Elegí una épica</option>
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
            <label htmlFor="story-priority" className="mb-1 block text-subheadline font-medium text-label">
              Prioridad
            </label>
            <select
              id="story-priority"
              name="priority"
              value={values.priority}
              onChange={handleChange}
              className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
            >
              {STORY_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="story-status" className="mb-1 block text-subheadline font-medium text-label">
              Estado
            </label>
            <select
              id="story-status"
              name="status"
              value={values.status}
              onChange={handleChange}
              className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
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
            <label htmlFor="story-points" className="mb-1 block text-subheadline font-medium text-label">
              Puntos
            </label>
            <input
              id="story-points"
              type="number"
              min="0"
              name="points"
              value={values.points}
              onChange={handleChange}
              className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="story-criteria" className="mb-1 block text-subheadline font-medium text-label">
              Criterios de aceptación
            </label>
            <input
              id="story-criteria"
              type="number"
              min="0"
              name="criteriaTotal"
              value={values.criteriaTotal}
              onChange={handleChange}
              className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="story-assignee" className="mb-1 block text-subheadline font-medium text-label">
            Responsable <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <select
            id="story-assignee"
            name="assigneeId"
            value={values.assigneeId}
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

        <div>
          <label htmlFor="story-sprint" className="mb-1 block text-subheadline font-medium text-label">
            Sprint <span className="font-normal text-label-tertiary">(opcional)</span>
          </label>
          <select
            id="story-sprint"
            name="sprintId"
            value={values.sprintId}
            onChange={handleChange}
            className="w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2 text-body text-label disabled:opacity-50"
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
            {submitting ? 'Creando…' : 'Crear historia'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
