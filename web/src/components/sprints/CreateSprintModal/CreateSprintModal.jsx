import { useState } from 'react'
import { Calendar, Flag, Gauge, Tag } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/Field/SelectField'
import { TextAreaField } from '@/components/ui/Field/TextAreaField'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { errorMessage } from '@/lib/errors'
import { SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { INITIAL_VALUES } from './CreateSprintModal.data'
import { validateSprintForm } from '@/lib/validate'
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
        {formError && <FormError>{formError}</FormError>}

        <TextField
          id="sprint-name"
          name="name"
          label="Nombre"
          icon={Tag}
          placeholder="Sprint 8"
          value={values.name}
          disabled={submitting}
          error={errors.name}
          onChange={handleChange}
        />

        <TextAreaField
          id="sprint-goal"
          name="goal"
          label="Meta"
          optional
          placeholder="Qué queremos haber terminado cuando cierre"
          value={values.goal}
          disabled={submitting}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="sprint-start"
            name="startDate"
            label="Fecha de inicio"
            icon={Calendar}
            type="date"
            value={values.startDate}
            disabled={submitting}
            error={errors.startDate}
            onChange={handleChange}
          />

          <TextField
            id="sprint-end"
            name="endDate"
            label="Fecha de fin"
            icon={Calendar}
            type="date"
            value={values.endDate}
            disabled={submitting}
            error={errors.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="sprint-capacity"
            name="capacity"
            label="Capacidad"
            icon={Gauge}
            type="number"
            min="0"
            placeholder="Puntos"
            value={values.capacity}
            disabled={submitting}
            error={errors.capacity}
            onChange={handleChange}
          />

          <SelectField
            id="sprint-status"
            name="status"
            label="Estado"
            value={values.status}
            disabled={submitting}
            onChange={handleChange}
          >
            {SPRINT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            <Flag className="size-4" aria-hidden="true" />
            {submitting ? 'Creando…' : 'Crear sprint'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
