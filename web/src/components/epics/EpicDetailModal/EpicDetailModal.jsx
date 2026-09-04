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
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'
import { validateEpicForm } from '@/lib/validate'
import { CONTROL_TEXTAREA, FIELD_LABEL, SIDE_CAPTION } from './EpicDetailModal.styles'
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
    const nextValues = { ...values, [e.target.name]: e.target.value }
    setValues(nextValues)
    setDirty(true)

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: validateEpicForm(nextValues)[e.target.name] })
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
                <DetailSelect
                  id={`epic-${epic.id}-owner`}
                  name="ownerId"
                  value={values.ownerId}
                  disabled={submitting}
                  onChange={handleChange}
                >
                  <option value="">Sin asignar</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </DetailSelect>
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
              className={CONTROL_TEXTAREA}
            />
          </div>

          <div>
            <p className="mb-1.5 text-subheadline font-medium text-label">Avance</p>
            {stats.total === 0 ? (
              <p className="text-footnote text-label-tertiary">
                Esta épica todavía no tiene tickets.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between text-footnote text-label-secondary">
                  <span>
                    {stats.completed} de {stats.total} tickets completados
                  </span>
                  <span>
                    {stats.pointsCompleted}/{stats.points} pts
                  </span>
                </div>
                <ProgressBar value={stats.completed} max={stats.total} className="mt-1.5" />
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
              Se eliminan también sus {stats.total === 1 ? 'ticket' : 'tickets'}. No se puede
              deshacer.
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
