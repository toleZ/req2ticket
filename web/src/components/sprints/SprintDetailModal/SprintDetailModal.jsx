import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/Badge/Badge'
import { DetailFooter } from '@/components/ui/DetailFooter/DetailFooter'
import { DetailHeader } from '@/components/ui/DetailHeader/DetailHeader'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { Modal } from '@/components/ui/Modal/Modal'
import { toast } from '@/components/ui/Toast/toast'
import { errorMessage } from '@/lib/errors'
import { findOption, SPRINT_COMPLETED, SPRINT_PLANNED, SPRINT_STATUS_OPTIONS } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'
import { validateSprintForm } from '@/lib/validate'
import { fieldIds, toDetailValues } from './SprintDetailModal.helpers'
import { SprintMainFields } from './SprintMainFields'
import { SprintSideFields } from './SprintSideFields'

/**
 * A sprint's record, with the same skeleton as EpicDetailModal: `lg` sheet, two columns and
 * the footer with three faces. Name, goal, dates and capacity can be changed here; the status
 * cannot — it moves with the Iniciar and Completar buttons of the list (ENT-5).
 *
 * Read only when you lack sprints.manage (`canManage`) and, for everyone, once the sprint is
 * completed: a finished sprint is history. Only a planned sprint can be deleted.
 *
 * `onUpdateSprint(sprint, patch)` and `onDeleteSprint(sprint)` return the request's promise.
 *
 * Like the epic sheet, it does not list the sprint's tickets — the expanded row already does,
 * and opening a ticket from in here would stack two modal sheets.
 *
 * This file keeps the state and the saving; the two columns are SprintSideFields and
 * SprintMainFields, which only draw what they get.
 */
export function SprintDetailModal({ sprint, tickets, canManage, onClose, onUpdateSprint, onDeleteSprint }) {
  const [values, setValues] = useState(() => toDetailValues(sprint))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [footerMode, setFooterMode] = useState('edit')
  const formRef = useRef(null)

  const ids = fieldIds(sprint.id)
  const status = findOption(SPRINT_STATUS_OPTIONS, sprint.status)
  const stats = summarizeTickets(tickets)
  const isCompleted = sprint.status === SPRINT_COMPLETED
  const isEditable = canManage && !isCompleted
  const canDelete = canManage && sprint.status === SPRINT_PLANNED
  const capacity = Number(values.capacity)

  /* The footer's first button is "Cancelar" in every mode: when the delete question appears the
     focus moves there, so a hurried Enter never deletes (FIX-3). */
  useEffect(() => {
    if (footerMode === 'confirmDelete') formRef.current?.lastElementChild?.querySelector('button')?.focus()
  }, [footerMode])

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
    if (!isEditable) return

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
      await onDeleteSprint(sprint)
      toast.success(
        stats.all > 0
          ? `${sprint.name} borrado. Sus ${stats.all} tickets volvieron al backlog`
          : `${sprint.name} borrado`,
      )
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
      setFooterMode('edit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={handleRequestClose} size="lg">
      <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        {/* The name is an editable field, so the heading is hidden, as in the other sheets. */}
        <h2 className="sr-only">{sprint.name}</h2>
        <DetailHeader
          badge={status && <Badge tone={status.tone}>{status.label}</Badge>}
          deleteLabel="Eliminar sprint"
          disabled={submitting}
          onDelete={canDelete ? () => setFooterMode('confirmDelete') : undefined}
          onClose={handleRequestClose}
        />

        <DetailLayout
          side={
            <SprintSideFields
              sprint={sprint}
              ids={ids}
              values={values}
              errors={errors}
              canManage={canManage}
              canDelete={canDelete}
              isEditable={isEditable}
              submitting={submitting}
              onFieldChange={handleFieldChange}
              onChange={handleChange}
            />
          }
        >
          <SprintMainFields
            sprint={sprint}
            ids={ids}
            values={values}
            errors={errors}
            stats={stats}
            isEditable={isEditable}
            isCompleted={isCompleted}
            submitting={submitting}
            onChange={handleChange}
          />
        </DetailLayout>

        {isEditable ? (
          <DetailFooter
            mode={footerMode}
            error={formError}
            submitting={submitting}
            confirmDeleteMessage={
              <>
                Se va a borrar <span className="font-medium text-label">{sprint.name}</span>.
                {stats.all === 1 && ' Su ticket vuelve al backlog.'}
                {stats.all > 1 && ` Sus ${stats.all} tickets vuelven al backlog.`} No se puede deshacer.
              </>
            }
            onExitConfirm={() => setFooterMode('edit')}
            onDelete={handleDelete}
            onCancel={handleRequestClose}
            onDiscard={onClose}
          />
        ) : (
          formError && (
            <p role="alert" className="px-6 pb-4 text-footnote text-red-text">
              {formError}
            </p>
          )
        )}
      </form>
    </Modal>
  )
}
