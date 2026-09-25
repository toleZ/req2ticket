import { useState } from 'react'

import { AccentColorPicker } from '@/components/epics/AccentColorPicker/AccentColorPicker'
import { Badge } from '@/components/ui/Badge/Badge'
import { DetailFooter } from '@/components/ui/DetailFooter/DetailFooter'
import { DetailHeader } from '@/components/ui/DetailHeader/DetailHeader'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { DetailRow } from '@/components/ui/DetailRow/DetailRow'
import { DetailSelect } from '@/components/ui/DetailRow/DetailSelect'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { Modal } from '@/components/ui/Modal/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { SearchSelect } from '@/components/ui/SearchSelect/SearchSelect'
import { SHEET_TEXTAREA } from '@/components/ui/SheetField/SheetField.styles'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import { userPickerOptions } from '@/lib/pickerOptions'
import { cancelledNote, summarizeTickets } from '@/lib/ticketStats'
import { validateEpicForm } from '@/lib/validate'
import {
  FIELD_LABEL,
  PROGRESS_META,
  SECTION_LABEL,
  SIDE_CAPTION,
} from './EpicDetailModal.styles'
import { toDetailValues } from './EpicDetailModal.helpers'
/**
 * An epic's record. Same skeleton as TicketDetailModal — `lg` sheet, two columns, a footer
 * with three faces — and for the same reasons; the long comments are over there.
 *
 * It does not show the epic's ticket list: the expanded row already does that, and there each
 * one can be clicked too. Repeating it here would be a second copy that also led nowhere,
 * because opening a ticket's modal from inside this one would leave two modal sheets stacked,
 * with two focus traps listening for the same Escape.
 */
export function EpicDetailModal({ epic, tickets, users, onClose, onUpdateEpic, onDeleteEpic }) {
  const [values, setValues] = useState(() => toDetailValues(epic))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [footerMode, setFooterMode] = useState('edit')

  const accent = findOption(ACCENT_COLORS, values.accentColor)
  const status = findOption(EPIC_STATUS_OPTIONS, values.status)
  const stats = summarizeTickets(tickets)

  function handleChange(e) {
    handleFieldChange(e.target.name, e.target.value)
  }

  function handleFieldChange(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    setDirty(true)

    if (errors[name]) {
      setErrors({ ...errors, [name]: validateEpicForm(nextValues)[name] })
    }
  }

  function handleAccentChange(accentColor) {
    setValues({ ...values, accentColor })
    setDirty(true)
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

    const found = validateEpicForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onUpdateEpic(epic, {
        /* `\s+` and not `trim()` alone: a line break pasted from the clipboard is the only one
           that can get in (Enter is blocked), and it has no place in a name. */
        name: values.name.replace(/\s+/g, ' ').trim(),
        description: values.description.trim(),
        accentColor: values.accentColor,
        priority: values.priority,
        status: values.status,
        ownerId: values.ownerId,
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
      // The page removes the epic from the list, and with that this modal goes on its own.
      await onDeleteEpic(epic)
    } catch (err) {
      setFormError(errorMessage(err))
      setFooterMode('edit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={handleRequestClose} size="lg" ariaLabel={`${epic.code}: ${epic.name}`}>
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        {/* Same as the ticket sheet: the title is an editable field, so a hidden heading. */}
        <h2 className="sr-only">
          {epic.code}: {epic.name}
        </h2>
        <DetailHeader
          leading={
            accent && (
              <span
                className={cn('size-2.5 shrink-0 rounded-full', accent.dotClass)}
                aria-hidden="true"
              />
            )
          }
          code={epic.code}
          badge={status && <Badge tone={status.tone}>{status.label}</Badge>}
          deleteLabel="Eliminar épica"
          disabled={submitting}
          onDelete={() => setFooterMode('confirmDelete')}
          onClose={handleRequestClose}
        />

        <DetailLayout
          side={
            <>
              <DetailRow label="Estado" htmlFor={`epic-${epic.id}-status`}>
                <DetailSelect
                  id={`epic-${epic.id}-status`}
                  name="status"
                  value={values.status}
                  disabled={submitting}
                  onChange={handleChange}
                >
                  {EPIC_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </DetailSelect>
              </DetailRow>

              <DetailRow label="Prioridad" htmlFor={`epic-${epic.id}-priority`}>
                <DetailSelect
                  id={`epic-${epic.id}-priority`}
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
              </DetailRow>

              <DetailRow label="Responsable" htmlFor={`epic-${epic.id}-owner`}>
                <div className="w-full min-w-0">
                  <SearchSelect
                    id={`epic-${epic.id}-owner`}
                    value={values.ownerId}
                    options={userPickerOptions(users, 'Sin asignar')}
                    searchLabel="Buscar persona"
                    noResults="Nadie coincide"
                    disabled={submitting}
                    onChange={(value) => handleFieldChange('ownerId', value)}
                  />
                </div>
              </DetailRow>

              {/* Stacked and not in a detail row: ten swatches do not fit beside the label. */}
              <div className="py-1">
                <p className={SIDE_CAPTION}>Color</p>
                <AccentColorPicker
                  value={values.accentColor}
                  disabled={submitting}
                  size="sm"
                  onChange={handleAccentChange}
                />
              </div>

              {/* No dates block, unlike the ticket modal: EpicResponse carries neither createdAt
                  nor updatedAt — the Epic entity simply has no such columns. It is not an
                  oversight, do not go looking for them. */}
            </>
          }
        >
          <InlineTitleField
            name="name"
            ariaLabel="Nombre"
            value={values.name}
            disabled={submitting}
            error={errors.name}
            onChange={handleChange}
          />

          <div>
            <label htmlFor={`epic-${epic.id}-description`} className={FIELD_LABEL}>
              Descripción
            </label>
            <textarea
              id={`epic-${epic.id}-description`}
              name="description"
              rows={4}
              value={values.description}
              disabled={submitting}
              onChange={handleChange}
              className={SHEET_TEXTAREA}
            />
          </div>

          <div>
            <p className={SECTION_LABEL}>Avance</p>
            {stats.all === 0 ? (
              <p className="text-footnote text-label-secondary">
                Esta épica todavía no tiene tickets.
              </p>
            ) : (
              <>
                <div className={PROGRESS_META}>
                  <span>
                    {stats.completed} de {stats.total} tickets completados
                    {cancelledNote(stats)}
                  </span>
                  <span>
                    {stats.pointsCompleted}/{stats.points} pts
                  </span>
                </div>
                <ProgressBar
                  value={stats.completed}
                  max={stats.total}
                  label={`Tickets completados: ${stats.completed} de ${stats.total}`}
                  className="mt-1.5"
                />
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
              {/* `all`, cancelled included: the backend deletes every one of them. */}
              {stats.all === 1 && 'Se elimina también su ticket. '}
              {stats.all > 1 && `Se eliminan también sus ${stats.all} tickets. `}
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
