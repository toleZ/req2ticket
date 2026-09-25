import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { FOOTER } from '@/components/ui/DetailFooter/DetailFooter.styles'
import { HEADER } from '@/components/ui/DetailHeader/DetailHeader.styles'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { Modal } from '@/components/ui/Modal/Modal'
import { SegmentedField } from '@/components/ui/SegmentedField/SegmentedField'
import { RequiredMark, RequiredNote, SheetField } from '@/components/ui/SheetField/SheetField'
import { SHEET_INPUT, SHEET_TEXTAREA, SIDE_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { errorMessage } from '@/lib/errors'
import { SPRINT_ACTIVE, SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { validateSprintForm } from '@/lib/validate'
import { FIELD_IDS, INITIAL_VALUES } from './CreateSprintModal.data'
import { FORM, FORM_ERROR, HINT, TITLE } from './CreateSprintModal.styles'

/**
 * The create sheet for a sprint: name and goal on the left, status, dates and capacity on the
 * right, the same shape as the ticket and epic sheets.
 *
 * `activeSprint` is the project's active sprint, or undefined. The API allows only one, so
 * while there is one the "Activo" option is disabled and a line below says which sprint holds
 * it, instead of letting the user pick it and then fail on submit.
 */
export function CreateSprintModal({ isOpen, activeSprint, onClose, onCreate }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const statusOptions = SPRINT_STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    disabled: option.value === SPRINT_ACTIVE && Boolean(activeSprint),
  }))

  function setField(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)

    // If the field already had an error, it is re-checked as you type so the message
    // disappears as soon as you fix it. A field with no error yet is not validated until
    // submit.
    if (errors[name]) {
      setErrors({ ...errors, [name]: validateSprintForm(nextValues)[name] })
    }
  }

  function handleChange(e) {
    setField(e.target.name, e.target.value)
  }

  function reset() {
    setValues(INITIAL_VALUES)
    setErrors({})
    setFormError('')
  }

  function handleClose() {
    if (submitting) return
    reset()
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateSprintForm(values)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      await onCreate({
        ...values,
        name: values.name.replace(/\s+/g, ' ').trim(),
        goal: values.goal.trim(),
      })
      // The sheet only closes once the sprint was created: if the POST fails, what was typed
      // stays on screen and the error shows in the footer.
      reset()
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" ariaLabel="Nuevo sprint">
      <form onSubmit={handleSubmit} className={FORM} noValidate>
        <div className={HEADER}>
          <h2 className={TITLE}>Nuevo sprint</h2>
          <div className="ml-auto">
            <IconButton label="Cerrar" onClick={handleClose} disabled={submitting}>
              <X className="size-4.5" aria-hidden="true" />
            </IconButton>
          </div>
        </div>

        <DetailLayout
          side={
            <div className="flex flex-col gap-4">
              <SheetField label="Estado">
                <SegmentedField
                  name="sprint-status"
                  legend="Estado"
                  options={statusOptions}
                  value={values.status}
                  disabled={submitting}
                  onChange={(value) => setField('status', value)}
                />
                {activeSprint && (
                  <p className={HINT}>Ya hay un sprint activo: {activeSprint.name}.</p>
                )}
              </SheetField>

              <div className="hairline-t flex flex-col gap-4 pt-4">
                <SheetField label="Inicio" htmlFor="sprint-start" required error={errors.startDate}>
                  <input
                    id="sprint-start"
                    type="date"
                    name="startDate"
                    value={values.startDate}
                    disabled={submitting}
                    aria-invalid={errors.startDate ? true : undefined}
                    aria-describedby={errors.startDate ? 'sprint-start-error' : undefined}
                    onChange={handleChange}
                    className={SHEET_INPUT}
                  />
                </SheetField>

                <SheetField label="Fin" htmlFor="sprint-end" required error={errors.endDate}>
                  <input
                    id="sprint-end"
                    type="date"
                    name="endDate"
                    min={values.startDate || undefined}
                    value={values.endDate}
                    disabled={submitting}
                    aria-invalid={errors.endDate ? true : undefined}
                    aria-describedby={errors.endDate ? 'sprint-end-error' : undefined}
                    onChange={handleChange}
                    className={SHEET_INPUT}
                  />
                </SheetField>
              </div>

              <SheetField label="Capacidad" htmlFor="sprint-capacity" required error={errors.capacity}>
                <div className="flex items-center gap-2">
                  <input
                    id="sprint-capacity"
                    type="number"
                    name="capacity"
                    min="0"
                    inputMode="numeric"
                    placeholder="0"
                    value={values.capacity}
                    disabled={submitting}
                    aria-invalid={errors.capacity ? true : undefined}
                    aria-describedby={errors.capacity ? 'sprint-capacity-error' : undefined}
                    onChange={handleChange}
                    className={`${SHEET_INPUT} max-w-24 tabular-nums`}
                  />
                  <span className="text-footnote text-label-secondary">puntos</span>
                </div>
              </SheetField>
            </div>
          }
        >
          <div>
            <label htmlFor="sprint-name" className={SIDE_LABEL}>
              Nombre<RequiredMark />
            </label>
            <InlineTitleField
              id="sprint-name"
              name="name"
              ariaLabel="Nombre"
              placeholder="Sprint 8"
              required
              value={values.name}
              disabled={submitting}
              error={errors.name}
              onChange={handleChange}
            />
          </div>

          <SheetField label="Meta" htmlFor="sprint-goal">
            <textarea
              id="sprint-goal"
              name="goal"
              rows={4}
              value={values.goal}
              disabled={submitting}
              onChange={handleChange}
              placeholder="Qué queremos haber terminado cuando cierre"
              className={SHEET_TEXTAREA}
            />
          </SheetField>
        </DetailLayout>

        <div className={FOOTER}>
          {formError ? (
            <p role="alert" className={FORM_ERROR}>
              {formError}
            </p>
          ) : (
            <RequiredNote />
          )}
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear sprint'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
