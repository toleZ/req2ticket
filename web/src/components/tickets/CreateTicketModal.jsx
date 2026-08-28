import { useEffect, useState } from 'react'
import { Hash, Type } from 'lucide-react'

import { TicketExtraFields } from '@/components/tickets/TicketExtraFields'
import { Modal } from '@/components/ui/Modal'
import { getUsers } from '@/lib/api'
import { errorMessage } from '@/lib/errors'
import { DESCRIPTION_PLACEHOLDER, emptyExtras, toExtraFieldsPayload } from '@/lib/ticketExtraFields'
import {
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
  TICKET_TYPE_OPTIONS,
} from '@/lib/ticketOptions'
import { validateTicketForm } from '@/lib/validate'

/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
const INITIAL_TYPE = 'userStory'

const INITIAL_VALUES = {
  type: INITIAL_TYPE,
  title: '',
  description: '',
  epicId: '',
  priority: 'medium',
  status: 'todo',
  points: '',
  assigneeId: '',
  sprintId: '',
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
   "submit", y sin él el botón crea el ticket en vez de cerrar. */
const CANCEL_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast
  ease-out-quad hover:bg-fill-tertiary hover:text-label disabled:opacity-50`

const SUBMIT_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

export function CreateTicketModal({ isOpen, onClose, onCreate, epics, sprints }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  /* Los campos extra van en su propio objeto y no dentro de `values`: son los únicos que
     cambian cuando cambia el tipo, y tenerlos separados hace que resetearlos sea una línea. */
  const [extras, setExtras] = useState(emptyExtras(INITIAL_TYPE))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [users, setUsers] = useState([])

  // The assignees come from the API. If it fails the select stays empty and the ticket can
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
      setErrors({ ...errors, [e.target.name]: validateTicketForm(nextValues)[e.target.name] })
    }
  }

  /* Cambiar el tipo cambia los campos de abajo. Se resetean a vacío en vez de intentar
     conservar lo escrito: los campos de un bug no existen en una tarea, y mandarle al back
     una clave que su tipo no acepta es un 400.

     Ojo: esto NO va en un useEffect que mire `values.type`. Un efecto correría también en el
     primer render y pisaría los extras cada vez que el modal se abre. Es la respuesta a un
     click, y las respuestas a un click van en el handler del click. */
  function handleTypeChange(e) {
    const type = e.target.value
    setValues({ ...values, type })
    setExtras(emptyExtras(type))
  }

  function handleExtraChange(name, value) {
    setExtras({ ...extras, [name]: value })
  }

  function handleClose() {
    if (submitting) return

    setValues(INITIAL_VALUES)
    setExtras(emptyExtras(INITIAL_TYPE))
    setErrors({})
    setFormError('')
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateTicketForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onCreate({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        extraFields: toExtraFieldsPayload(values.type, extras),
      })
      // The modal only closes once the ticket was created: if the POST fails, what was
      // typed stays on screen and the error is shown above.
      setValues(INITIAL_VALUES)
      setExtras(emptyExtras(INITIAL_TYPE))
      setErrors({})
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo ticket">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && (
          <p className={FORM_ERROR} role="alert">
            {formError}
          </p>
        )}

        {/* Los aria del control tienen que apuntar al id EXACTO del <p> del error: si no
            coinciden, el lector de pantalla no lo lee y nada falla a la vista. */}
        <div>
          <label htmlFor="ticket-type" className={LABEL}>
            Tipo
          </label>
          <select
            id="ticket-type"
            name="type"
            value={values.type}
            disabled={submitting}
            onChange={handleTypeChange}
            className={CONTROL}
          >
            {TICKET_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ticket-title" className={LABEL}>
            Título
          </label>
          <div className="relative">
            <span className={ICON_WRAP} aria-hidden="true">
              <Type className="size-4" />
            </span>
            <input
              id="ticket-title"
              name="title"
              value={values.title}
              disabled={submitting}
              onChange={handleChange}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? 'ticket-title-error' : undefined}
              className={CONTROL_ICON}
            />
          </div>
          {errors.title && (
            <p id="ticket-title-error" className={FIELD_ERROR}>
              {errors.title}
            </p>
          )}
        </div>

        {/* El placeholder cambia con el tipo: una historia sugiere el "Como… quiero… para…"
            que antes eran tres campos. Es una sugerencia y nada más — el campo sigue siendo
            texto libre y no se valida contra ese formato. */}
        <div>
          <label htmlFor="ticket-description" className={LABEL}>
            Descripción <span className={OPTIONAL}>(opcional)</span>
          </label>
          <textarea
            id="ticket-description"
            name="description"
            rows={2}
            placeholder={DESCRIPTION_PLACEHOLDER[values.type] || ''}
            value={values.description}
            disabled={submitting}
            onChange={handleChange}
            className={CONTROL_TEXTAREA}
          />
        </div>

        <div>
          <label htmlFor="ticket-epic" className={LABEL}>
            Épica
          </label>
          <select
            id="ticket-epic"
            name="epicId"
            value={values.epicId}
            disabled={submitting}
            onChange={handleChange}
            aria-invalid={errors.epicId ? true : undefined}
            aria-describedby={errors.epicId ? 'ticket-epic-error' : undefined}
            className={CONTROL}
          >
            <option value="">Elegí una épica</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.name}
              </option>
            ))}
          </select>
          {errors.epicId && (
            <p id="ticket-epic-error" className={FIELD_ERROR}>
              {errors.epicId}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ticket-priority" className={LABEL}>
              Prioridad
            </label>
            <select
              id="ticket-priority"
              name="priority"
              value={values.priority}
              disabled={submitting}
              onChange={handleChange}
              className={CONTROL}
            >
              {TICKET_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ticket-status" className={LABEL}>
              Estado
            </label>
            <select
              id="ticket-status"
              name="status"
              value={values.status}
              disabled={submitting}
              onChange={handleChange}
              className={CONTROL}
            >
              {TICKET_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ticket-points" className={LABEL}>
            Puntos
          </label>
          <div className="relative">
            <span className={ICON_WRAP} aria-hidden="true">
              <Hash className="size-4" />
            </span>
            <input
              id="ticket-points"
              name="points"
              type="number"
              min="0"
              placeholder="0"
              value={values.points}
              disabled={submitting}
              onChange={handleChange}
              className={CONTROL_ICON}
            />
          </div>
        </div>

        <div>
          <label htmlFor="ticket-assignee" className={LABEL}>
            Responsable <span className={OPTIONAL}>(opcional)</span>
          </label>
          <select
            id="ticket-assignee"
            name="assigneeId"
            value={values.assigneeId}
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

        <div>
          <label htmlFor="ticket-sprint" className={LABEL}>
            Sprint <span className={OPTIONAL}>(opcional)</span>
          </label>
          <select
            id="ticket-sprint"
            name="sprintId"
            value={values.sprintId}
            disabled={submitting}
            onChange={handleChange}
            className={CONTROL}
          >
            <option value="">Sin sprint (backlog)</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>

        {/* Los campos propios del tipo elegido arriba. Es el mismo componente para los
            cuatro: la lista sale de EXTRA_FIELDS en lib/ticketExtraFields.js. Acá se dibujan
            todos, incluidos los `select`; el modal de detalle es el que los separa. */}
        <TicketExtraFields
          type={values.type}
          values={extras}
          onChange={handleExtraChange}
          disabled={submitting}
          idPrefix="ticket-nuevo"
          optional
        />

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
            {submitting ? 'Creando…' : 'Crear ticket'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
