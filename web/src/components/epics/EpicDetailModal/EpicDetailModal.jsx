import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/Badge/Badge'
import { DetailFooter } from '@/components/ui/DetailFooter/DetailFooter'
import { DetailHeader } from '@/components/ui/DetailHeader/DetailHeader'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { Modal } from '@/components/ui/Modal/Modal'
import { toast } from '@/components/ui/Toast/toast'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_STATUS_OPTIONS, findOption } from '@/lib/options'
import { errorMessage } from '@/lib/errors'
import { useDeleteEpic, useEpic, useUpdateEpic } from '@/lib/queries/epics'
import { summarizeTickets } from '@/lib/ticketStats'
import { validateEpicForm } from '@/lib/validate'
import { EpicMainFields } from './EpicMainFields'
import { EpicSideFields } from './EpicSideFields'
import { toDetailValues } from './EpicDetailModal.helpers'

/**
 * An epic's record. Same skeleton as TicketDetailModal — `lg` sheet, two columns, a footer
 * with three faces.
 *
 * It reads the epic itself (useEpic): it opens at once with the row from the list and the
 * description arrives a moment later. What you type is kept apart from the epic (`edits`) and
 * laid over it, so the form never has to be "seeded" when the full detail arrives.
 *
 * `canManage` is the epics.manage permission. Without it every field is plain text and there
 * is nothing to save or delete (AUTH-1). `openTicketsHref` is the Backlog filtered to this
 * epic's open tickets, for the "why can't I close it" link.
 *
 * It does not list the epic's tickets: the expanded row already does, and opening a ticket
 * from in here would stack two modal sheets, and one Escape would close both.
 *
 * This file keeps the state and the saving; the two columns are EpicSideFields and
 * EpicMainFields, which only draw what they get.
 */
export function EpicDetailModal({ projectId, epicId, tickets, members, canManage, openTicketsHref, onClose }) {
  const { data: epic, isPlaceholderData } = useEpic(projectId, epicId)
  const updateEpic = useUpdateEpic(projectId)
  const deleteEpic = useDeleteEpic(projectId)

  const [edits, setEdits] = useState({})
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [footerMode, setFooterMode] = useState('edit')
  const formRef = useRef(null)

  /* The footer's first button is "Cancelar" in every mode. When the delete question appears the
     focus moves there, so an Enter pressed in a hurry never deletes (FIX-3). */
  useEffect(() => {
    if (footerMode === 'confirmDelete') formRef.current?.lastElementChild?.querySelector('button')?.focus()
  }, [footerMode])

  // Deleted while open (here or in another tab): the page closes the sheet; nothing to draw.
  if (!epic) return null

  const submitting = updateEpic.isPending || deleteEpic.isPending
  const values = { ...toDetailValues(epic), ...edits }
  const dirty = Object.keys(edits).length > 0
  const accent = findOption(ACCENT_COLORS, values.accentColor)
  const status = findOption(EPIC_STATUS_OPTIONS, epic.status)
  const stats = summarizeTickets(tickets)
  const isClosed = epic.status === 'closed'
  const openCount = epic.openTicketsCount ?? 0

  function handleChange(e) {
    handleFieldChange(e.target.name, e.target.value)
  }

  function handleFieldChange(name, value) {
    const nextEdits = { ...edits, [name]: value }
    setEdits(nextEdits)

    if (errors[name]) {
      setErrors({ ...errors, [name]: validateEpicForm({ ...values, [name]: value })[name] })
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

  async function save(patch) {
    setFormError('')
    try {
      await updateEpic.mutateAsync({ epic, patch })
      return true
    } catch (err) {
      setFormError(errorMessage(err))
      return false
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canManage || isPlaceholderData) return

    const found = validateEpicForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    const saved = await save({
      /* `\s+` and not `trim()` alone: a line break pasted from the clipboard has no place in a name. */
      name: values.name.replace(/\s+/g, ' ').trim(),
      description: values.description.trim(),
      accentColor: values.accentColor,
      priority: values.priority,
      status: values.status,
      ownerId: values.ownerId,
    })
    if (saved) onClose()
  }

  // "Cerrar épica" and "Reabrir" save the status alone, right away, keeping any other edit pending.
  async function handleSetStatus(nextStatus) {
    const saved = await save({ status: nextStatus })
    if (saved) {
      const rest = { ...edits }
      delete rest.status
      setEdits(rest)
      toast.success(nextStatus === 'closed' ? `${epic.name} quedó cerrada` : `${epic.name} se reabrió`)
    }
  }

  async function handleDelete() {
    setFormError('')
    try {
      await deleteEpic.mutateAsync(epic.id)
      toast.success(
        epic.ticketCount > 0
          ? `Épica ${epic.name} borrada, con sus ${epic.ticketCount} tickets`
          : `Épica ${epic.name} borrada`,
      )
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
      setFooterMode('edit')
    }
  }

  const ticketWord = epic.ticketCount === 1 ? 'su ticket' : `sus ${epic.ticketCount} tickets`

  return (
    <Modal isOpen onClose={handleRequestClose} size="lg">
      <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
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
          disabled={submitting || isPlaceholderData}
          onDelete={canManage ? () => setFooterMode('confirmDelete') : undefined}
          onClose={handleRequestClose}
        />

        <DetailLayout
          side={
            <EpicSideFields
              epic={epic}
              values={values}
              members={members}
              canManage={canManage}
              submitting={submitting}
              isPlaceholderData={isPlaceholderData}
              isClosed={isClosed}
              openCount={openCount}
              openTicketsHref={openTicketsHref}
              onFieldChange={handleFieldChange}
              onSetStatus={handleSetStatus}
            />
          }
        >
          <EpicMainFields
            epic={epic}
            values={values}
            errors={errors}
            stats={stats}
            canManage={canManage}
            submitting={submitting}
            isPlaceholderData={isPlaceholderData}
            isClosed={isClosed}
            onChange={handleChange}
            onSetStatus={handleSetStatus}
          />
        </DetailLayout>

        {canManage ? (
          <DetailFooter
            mode={footerMode}
            error={formError}
            submitting={submitting}
            confirmDeleteMessage={
              <>
                Se va a borrar la épica <span className="font-medium text-label">{epic.name}</span>
                {epic.ticketCount > 0 && ` y ${ticketWord}`}. No se puede deshacer.
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
