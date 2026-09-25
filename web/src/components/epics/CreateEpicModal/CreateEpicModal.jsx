import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { AccentColorPicker } from '@/components/epics/AccentColorPicker/AccentColorPicker'
import { Button } from '@/components/ui/Button/Button'
import { FOOTER } from '@/components/ui/DetailFooter/DetailFooter.styles'
import { HEADER } from '@/components/ui/DetailHeader/DetailHeader.styles'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { DetailSelect } from '@/components/ui/DetailRow/DetailSelect'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { Modal } from '@/components/ui/Modal/Modal'
import { SearchSelect } from '@/components/ui/SearchSelect/SearchSelect'
import { SegmentedField } from '@/components/ui/SegmentedField/SegmentedField'
import { RequiredMark, RequiredNote, SheetField } from '@/components/ui/SheetField/SheetField'
import { SHEET_TEXTAREA, SIDE_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { getUsers } from '@/lib/api'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import { userPickerOptions } from '@/lib/pickerOptions'
import { validateEpicForm } from '@/lib/validate'
import { FIELD_IDS, INITIAL_VALUES } from './CreateEpicModal.data'
import { FORM, FORM_ERROR, INTRO, TITLE } from './CreateEpicModal.styles'

/**
 * The create sheet for an epic, with the epic sheet's shape: name and description on the
 * left, status, priority, owner and colour on the right. The dot in the header takes the
 * colour as you pick it, the way the epic will show up in the lists.
 */
export function CreateEpicModal({ isOpen, onClose, onCreate }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [users, setUsers] = useState([])

  // The owners come from the API. If it fails the picker only offers "Sin asignar" and the
  // epic can still be created without anyone.
  useEffect(() => {
    if (!isOpen) return

    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [isOpen])

  const accent = findOption(ACCENT_COLORS, values.accentColor)

  function setField(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)

    // If the field already had an error, it is re-checked as you type so the message
    // disappears as soon as you fix it. A field with no error yet is not validated until
    // submit.
    if (errors[name]) {
      setErrors({ ...errors, [name]: validateEpicForm(nextValues)[name] })
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
    const found = validateEpicForm(values)
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
        description: values.description.trim(),
      })
      // The sheet only closes once the epic was created: if the POST fails, what was typed
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
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" ariaLabel="Nueva épica">
      <form onSubmit={handleSubmit} className={FORM} noValidate>
        <div className={HEADER}>
          <span
            className={cn('size-2.5 shrink-0 rounded-full', accent ? accent.dotClass : 'bg-gray')}
            aria-hidden="true"
          />
          <h2 className={TITLE}>Nueva épica</h2>
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
                  name="epic-status"
                  legend="Estado"
                  options={EPIC_STATUS_OPTIONS}
                  value={values.status}
                  disabled={submitting}
                  onChange={(value) => setField('status', value)}
                />
              </SheetField>

              <SheetField label="Prioridad" htmlFor="epic-priority">
                <DetailSelect
                  id="epic-priority"
                  name="priority"
                  value={values.priority}
                  disabled={submitting}
                  onChange={handleChange}
                >
                  {EPIC_PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </DetailSelect>
              </SheetField>

              <div className="hairline-t pt-4">
                <SheetField label="Responsable" htmlFor="epic-owner">
                  <SearchSelect
                    id="epic-owner"
                    value={values.ownerId}
                    options={userPickerOptions(users, 'Sin asignar')}
                    searchLabel="Buscar persona"
                    noResults="Nadie coincide"
                    disabled={submitting}
                    onChange={(value) => setField('ownerId', value)}
                  />
                </SheetField>
              </div>

              <SheetField label="Color">
                <AccentColorPicker
                  value={values.accentColor}
                  size="sm"
                  disabled={submitting}
                  onChange={(value) => setField('accentColor', value)}
                />
              </SheetField>
            </div>
          }
        >
          <div>
            <label htmlFor="epic-name" className={SIDE_LABEL}>
              Nombre<RequiredMark />
            </label>
            <InlineTitleField
              id="epic-name"
              name="name"
              ariaLabel="Nombre"
              placeholder="Nombre de la épica"
              required
              value={values.name}
              disabled={submitting}
              error={errors.name}
              onChange={handleChange}
            />
            <p className={INTRO}>Una épica agrupa los tickets que persiguen un mismo objetivo.</p>
          </div>

          <SheetField label="Descripción" htmlFor="epic-description">
            <textarea
              id="epic-description"
              name="description"
              rows={5}
              value={values.description}
              disabled={submitting}
              onChange={handleChange}
              placeholder="Qué abarca y qué queda afuera"
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
            {submitting ? 'Creando…' : 'Crear épica'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
