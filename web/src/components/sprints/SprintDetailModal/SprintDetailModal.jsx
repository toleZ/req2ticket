import { useState } from 'react'

import { Badge } from '@/components/ui/Badge/Badge'
import { DatePicker } from '@/components/ui/DatePicker/DatePicker'
import { DetailFooter } from '@/components/ui/DetailFooter/DetailFooter'
import { DetailHeader } from '@/components/ui/DetailHeader/DetailHeader'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { DetailRow } from '@/components/ui/DetailRow/DetailRow'
import { DetailSelect } from '@/components/ui/DetailRow/DetailSelect'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { Modal } from '@/components/ui/Modal/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { SHEET_INPUT, SHEET_TEXTAREA } from '@/components/ui/SheetField/SheetField.styles'
import { errorMessage } from '@/lib/errors'
import { findOption, SPRINT_ACTIVE, SPRINT_STATUS_OPTIONS } from '@/lib/options'
import { cancelledNote, summarizeTickets } from '@/lib/ticketStats'
import { validateSprintForm } from '@/lib/validate'
import { fieldIds, toDetailValues } from './SprintDetailModal.helpers'
import {
  FIELD_LABEL,
  OVER_CAPACITY,
  PROGRESS_META,
  SECTION_LABEL,
  SIDE_ERROR,
  SIDE_NOTE,
} from './SprintDetailModal.styles'

/**
 * A sprint's record, with the same skeleton as EpicDetailModal: `lg` sheet, two columns and
 * the footer with three faces. Name, goal, status, dates and capacity can all be changed here.
 *
 * `activeSprint` is the project's active sprint, or undefined. When it is another sprint, the
 * "Activo" option is disabled and a line says which sprint holds it: the API allows only one.
 *
 * Like the epic sheet, it does not list the sprint's tickets — the expanded row already does,
 * and opening a ticket from in here would stack two modal sheets.
 */
export function SprintDetailModal({ sprint, tickets, activeSprint, onClose, onUpdateSprint, onDeleteSprint }) {
  const [values, setValues] = useState(() => toDetailValues(sprint))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [footerMode, setFooterMode] = useState('edit')

  const ids = fieldIds(sprint.id)
  const status = findOption(SPRINT_STATUS_OPTIONS, values.status)
  const stats = summarizeTickets(tickets)
  const capacity = Number(values.capacity)
  const overCapacity = values.capacity === '' ? 0 : stats.points - capacity
  const otherActive = activeSprint && activeSprint.id !== sprint.id ? activeSprint : null

  function handleChange(e) {
    handleFieldChange(e.target.name, e.target.value)
  }

  function handleFieldChange(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    setDirty(true)

    if (errors[name]) {
      setErrors({ ...errors, [name]: validateSprintForm(nextValues)[name] })
    }
  }

  function handleRequestClose() {
    if (submitting) return

    if (footerMode !== 'edit') {
      setFooterMode('edit')
      return
    }

    if (dirty) {
      setFooterMode('confirmDiscard')
      return
    }

    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const found = validateSprintForm(values)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementById(ids[firstInvalid])?.focus()
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      await onUpdateSprint(sprint, {
        name: values.name.replace(/\s+/g, ' ').trim(),
        goal: values.goal.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        capacity,
        status: values.status,
      })
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setFormError('')
    setSubmitting(true)
    try {
      // The page removes the sprint from the list, and with that this modal goes on its own.
      await onDeleteSprint(sprint)
    } catch (err) {
      setFormError(errorMessage(err))
      setFooterMode('edit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={handleRequestClose} size="lg" ariaLabel={sprint.name}>
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        {/* The name is an editable field, so the heading is hidden, as in the other sheets. */}
        <h2 className="sr-only">{sprint.name}</h2>
        <DetailHeader
          badge={status && <Badge tone={status.tone}>{status.label}</Badge>}
          deleteLabel="Eliminar sprint"
          disabled={submitting}
          onDelete={() => setFooterMode('confirmDelete')}
          onClose={handleRequestClose}
        />

        <DetailLayout
          side={
            <>
              <DetailRow label="Estado" htmlFor={`sprint-${sprint.id}-status`}>
                <DetailSelect
                  id={`sprint-${sprint.id}-status`}
                  name="status"
                  value={values.status}
                  disabled={submitting}
                  onChange={handleChange}
                >
                  {SPRINT_STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.value === SPRINT_ACTIVE && Boolean(otherActive)}
                    >
                      {option.label}
                    </option>
                  ))}
                </DetailSelect>
              </DetailRow>
              {otherActive && values.status !== SPRINT_ACTIVE && (
                <p className={SIDE_NOTE}>Para iniciarlo, completá antes {otherActive.name}.</p>
              )}

              <DetailRow label="Inicio" htmlFor={ids.startDate}>
                <DatePicker
                  id={ids.startDate}
                  value={values.startDate}
                  range={{ start: values.startDate, end: values.endDate }}
                  disabled={submitting}
                  error={errors.startDate}
                  onChange={(value) => handleFieldChange('startDate', value)}
                />
              </DetailRow>
              {errors.startDate && (
                <p id={`${ids.startDate}-error`} className={SIDE_ERROR}>
                  {errors.startDate}
                </p>
              )}

              <DetailRow label="Fin" htmlFor={ids.endDate}>
                <DatePicker
                  id={ids.endDate}
                  value={values.endDate}
                  min={values.startDate || undefined}
                  range={{ start: values.startDate, end: values.endDate }}
                  disabled={submitting}
                  error={errors.endDate}
                  onChange={(value) => handleFieldChange('endDate', value)}
                />
              </DetailRow>
              {errors.endDate && (
                <p id={`${ids.endDate}-error`} className={SIDE_ERROR}>
                  {errors.endDate}
                </p>
              )}

              <DetailRow label="Capacidad" htmlFor={ids.capacity}>
                <input
                  id={ids.capacity}
                  type="number"
                  name="capacity"
                  min="0"
                  inputMode="numeric"
                  value={values.capacity}
                  disabled={submitting}
                  aria-invalid={errors.capacity ? true : undefined}
                  aria-describedby={errors.capacity ? `${ids.capacity}-error` : undefined}
                  onChange={handleChange}
                  className={`${SHEET_INPUT} max-w-20 tabular-nums`}
                />
                <span className="text-footnote text-label-secondary">pts</span>
              </DetailRow>
              {errors.capacity && (
                <p id={`${ids.capacity}-error`} className={SIDE_ERROR}>
                  {errors.capacity}
                </p>
              )}
            </>
          }
        >
          <InlineTitleField
            id={ids.name}
            name="name"
            ariaLabel="Nombre"
            value={values.name}
            disabled={submitting}
            error={errors.name}
            onChange={handleChange}
          />

          <div>
            <label htmlFor={`sprint-${sprint.id}-goal`} className={FIELD_LABEL}>
              Meta
            </label>
            <textarea
              id={`sprint-${sprint.id}-goal`}
              name="goal"
              rows={4}
              value={values.goal}
              disabled={submitting}
              onChange={handleChange}
              placeholder="Qué queremos haber terminado cuando cierre"
              className={SHEET_TEXTAREA}
            />
          </div>

          <div>
            <p className={SECTION_LABEL}>Avance</p>
            {stats.all === 0 ? (
              <p className="text-footnote text-label-secondary">
                Todavía no hay tickets asignados a este sprint.
              </p>
            ) : (
              <>
                <div className={PROGRESS_META}>
                  <span>
                    {stats.completed} de {stats.total} tickets completados
                    {cancelledNote(stats)}
                  </span>
                  <span className="tabular-nums">
                    {stats.pointsCompleted}/{stats.points} pts
                  </span>
                </div>
                <ProgressBar
                  value={stats.completed}
                  max={stats.total}
                  label={`Tickets completados: ${stats.completed} de ${stats.total}`}
                  className="mt-1.5"
                />
                {/* Recomputed from the field, so it answers while the capacity is being typed. */}
                {overCapacity > 0 && (
                  <p className={OVER_CAPACITY}>
                    Los tickets suman {stats.points} pts: {overCapacity} más de lo que entra.
                  </p>
                )}
              </>
            )}
          </div>
        </DetailLayout>

        <DetailFooter
          mode={footerMode}
          error={formError}
          submitting={submitting}
          confirmDeleteMessage={
            <>
              {/* The backend leaves them without a sprint (SetNull), it does not delete them. */}
              {stats.all === 1 && 'Su ticket vuelve al backlog. '}
              {stats.all > 1 && `Sus ${stats.all} tickets vuelven al backlog. `}
              No se puede deshacer.
            </>
          }
          onExitConfirm={() => setFooterMode('edit')}
          onDelete={handleDelete}
          onCancel={handleRequestClose}
          onDiscard={onClose}
        />
      </form>
    </Modal>
  )
}
