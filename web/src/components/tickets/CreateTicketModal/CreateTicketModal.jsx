import { useEffect, useState } from 'react'
import { Hash, Type } from 'lucide-react'

import { TicketExtraFields } from '@/components/tickets/TicketExtraFields/TicketExtraFields'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/Field/SelectField'
import { TextAreaField } from '@/components/ui/Field/TextAreaField'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
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

export function CreateTicketModal({ isOpen, onClose, onCreate, epics, sprints }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  /* The extra fields go in their own object and not inside `values`: they are the only ones
     that change when the type changes, and keeping them apart makes resetting them one line. */
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

  /* Changing the type changes the fields below. They reset to empty instead of trying to keep
     what was typed: a bug's fields do not exist on a task, and sending the backend a key its
     type does not accept is a 400.

     Careful: this does NOT belong in a useEffect watching `values.type`. An effect would also
     run on the first render and would wipe the extras every time the modal opens. It is the
     answer to a click, and answers to a click go in the click's handler. */
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
        {formError && <FormError>{formError}</FormError>}

        <SelectField
          id="ticket-type"
          name="type"
          label="Tipo"
          value={values.type}
          disabled={submitting}
          onChange={handleTypeChange}
        >
          {TICKET_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <TextField
          id="ticket-title"
          name="title"
          label="Título"
          icon={Type}
          value={values.title}
          disabled={submitting}
          error={errors.title}
          onChange={handleChange}
        />

        {/* The placeholder changes with the type: a story suggests the "Como… quiero… para…"
            that used to be three fields. It is a suggestion and nothing more — the field is
            still free text and is not validated against that format. */}
        <TextAreaField
          id="ticket-description"
          name="description"
          label="Descripción"
          optional
          placeholder={DESCRIPTION_PLACEHOLDER[values.type] || ''}
          value={values.description}
          disabled={submitting}
          onChange={handleChange}
        />

        <SelectField
          id="ticket-epic"
          name="epicId"
          label="Épica"
          value={values.epicId}
          disabled={submitting}
          error={errors.epicId}
          onChange={handleChange}
        >
          <option value="">Elegí una épica</option>
          {epics.map((epic) => (
            <option key={epic.id} value={epic.id}>
              {epic.name}
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            id="ticket-priority"
            name="priority"
            label="Prioridad"
            value={values.priority}
            disabled={submitting}
            onChange={handleChange}
          >
            {TICKET_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="ticket-status"
            name="status"
            label="Estado"
            value={values.status}
            disabled={submitting}
            onChange={handleChange}
          >
            {TICKET_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          id="ticket-points"
          name="points"
          label="Puntos"
          icon={Hash}
          type="number"
          min="0"
          placeholder="0"
          value={values.points}
          disabled={submitting}
          onChange={handleChange}
        />

        <SelectField
          id="ticket-assignee"
          name="assigneeId"
          label="Responsable"
          optional
          value={values.assigneeId}
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

        <SelectField
          id="ticket-sprint"
          name="sprintId"
          label="Sprint"
          optional
          value={values.sprintId}
          disabled={submitting}
          onChange={handleChange}
        >
          <option value="">Sin sprint (backlog)</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </SelectField>

        {/* The fields belonging to the type chosen above. It is the same component for all
            four: the list comes from EXTRA_FIELDS in lib/ticketExtraFields.js. Here they are
            all drawn, `select`s included; the detail modal is the one that splits them. */}
        <TicketExtraFields
          type={values.type}
          values={extras}
          onChange={handleExtraChange}
          disabled={submitting}
          idPrefix="ticket-nuevo"
          optional
        />

        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
