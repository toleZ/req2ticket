import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { FOOTER } from '@/components/ui/DetailFooter/DetailFooter.styles'
import { HEADER } from '@/components/ui/DetailHeader/DetailHeader.styles'
import { DatePicker } from '@/components/ui/DatePicker/DatePicker'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { Modal } from '@/components/ui/Modal/Modal'
import { RequiredMark, RequiredNote, SheetField } from '@/components/ui/SheetField/SheetField'
import { SHEET_INPUT, SHEET_TEXTAREA, SIDE_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { errorMessage } from '@/lib/errors'
import { validateSprintForm } from '@/lib/validate'
import { FIELD_IDS, INITIAL_VALUES } from './CreateSprintModal.data'
import { FORM, FORM_ERROR, HINT, TITLE } from './CreateSprintModal.styles'

/**
 * The create sheet for a sprint: name and goal on the left, dates and capacity on the right,
 * the same shape as the ticket and epic sheets.
 *
 * There is no status to pick: every sprint is born planned, and starting it is the list's
 * "Iniciar" button (ENT-5).
 */
export function CreateSprintModal({ isOpen, onClose, onCreate }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

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
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
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
              <p className={HINT}>Se crea planificado. Lo iniciás desde la lista cuando arranque.</p>

              <div className="hairline-t flex flex-col gap-4 pt-4">
                <SheetField label="Inicio" htmlFor="sprint-start" required error={errors.startDate}>
                  <DatePicker
                    id="sprint-start"
                    value={values.startDate}
                    range={{ start: values.startDate, end: values.endDate }}
                    disabled={submitting}
                    error={errors.startDate}
                    onChange={(value) => setField('startDate', value)}
                  />
                </SheetField>

                <SheetField label="Fin" htmlFor="sprint-end" required error={errors.endDate}>
                  <DatePicker
                    id="sprint-end"
                    value={values.endDate}
                    min={values.startDate || undefined}
                    range={{ start: values.startDate, end: values.endDate }}
                    disabled={submitting}
                    error={errors.endDate}
                    onChange={(value) => setField('endDate', value)}
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
                    max="999"
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
              maxLength={500}
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
