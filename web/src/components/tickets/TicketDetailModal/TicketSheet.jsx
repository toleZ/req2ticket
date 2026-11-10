import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'

import { withParent } from '@/components/tickets/TicketPickers/TicketPickers'
import { TicketTypeFields } from '@/components/tickets/TicketTypeFields/TicketTypeFields'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Badge } from '@/components/ui/Badge/Badge'
import { Banner } from '@/components/ui/Banner/Banner'
import { Button } from '@/components/ui/Button/Button'
import { DetailFooter } from '@/components/ui/DetailFooter/DetailFooter'
import { FOOTER } from '@/components/ui/DetailFooter/DetailFooter.styles'
import { DetailHeader } from '@/components/ui/DetailHeader/DetailHeader'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { Modal } from '@/components/ui/Modal/Modal'
import { toast } from '@/components/ui/Toast/toast'
import { errorMessage } from '@/lib/errors'
import { useEpics } from '@/lib/queries/epics'
import { useMembers } from '@/lib/queries/members'
import { useSprints } from '@/lib/queries/sprints'
import { useChangeTicketStatus, useDeleteTicket, useTickets, useUpdateTicket } from '@/lib/queries/tickets'
import { useWorkflow } from '@/lib/queries/workflow'
import { isOpenStatus } from '@/lib/options'
import { ticketToFormValues, toFormErrors } from '@/lib/ticketTypes'
import { validateTicketForm } from '@/lib/validate'
import { isFinalStatus, labelOf, statusContext } from '@/lib/workflow'
import { ChildShortcuts, TicketChildren } from './TicketChildren'
import { TicketDescription } from './TicketDescription'
import { deleteMessage, statusOf } from './TicketDetailModal.helpers'
import { TicketSideFields } from './TicketSideFields'
import { TicketTitle } from './TicketTitle'

/**
 * The editable sheet of a ticket, mounted by TicketDetailModal once the detail is complete. The
 * form is seeded from `ticket` here, and only here (it is mounted with key={ticket.id}, so it is
 * never resynced from an effect).
 *
 * This file keeps the form's state and what each button does. What is drawn lives next to it:
 * TicketSideFields (the side column), TicketTitle, TicketDescription, TicketTypeFields (the
 * type's own fields), TicketChildren and ChildShortcuts.
 */
export function TicketSheet({ projectId, ticket, canWrite, canDelete, onClose, onCreateChild }) {
  const [values, setValues] = useState(() => ticketToFormValues(ticket))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [formError, setFormError] = useState('')
  const [statusError, setStatusError] = useState('')
  /* A tick saves on its own (see handleChecklistToggle): the error of the last one that failed. */
  const [checklistError, setChecklistError] = useState(null)

  /* The footer's three faces — normal, "are you sure you want to delete it?" and "you have
     unsaved changes" — instead of a ConfirmModal on top: two modals would be two Escape
     listeners, and one key press would close both. */
  const [footerMode, setFooterMode] = useState('edit')
  /* The status waiting for "Cambiar estado" while the footer asks (footerMode 'confirmStatus'). */
  const [pendingStatus, setPendingStatus] = useState(null)
  const formRef = useRef(null)

  const { data: workflow } = useWorkflow(projectId)
  const { data: epics = [] } = useEpics(projectId)
  const { data: sprints = [] } = useSprints(projectId)
  const { data: members = [] } = useMembers(projectId)
  const { data: tickets = [] } = useTickets(projectId)
  const updateTicket = useUpdateTicket(projectId)
  /* Its own instance for the ticks: a tick saving must not dim the whole form as "Guardando…". */
  const saveChecklist = useUpdateTicket(projectId)
  const changeStatus = useChangeTicketStatus(projectId)
  const deleteTicket = useDeleteTicket(projectId)

  const submitting = updateTicket.isPending || deleteTicket.isPending
  const epicClosed = ticket.epicStatus === 'closed'
  // No tickets.write, an archived project (its permissions are already empty) or a closed epic.
  const editable = canWrite && !epicClosed
  const readOnly = !editable
  const status = statusOf(ticket.status)
  const context = statusContext(ticket, tickets, sprints)

  /* FIX-3: the confirmation starts with the focus on Cancelar, so an Enter pressed in a hurry
     never deletes. It is the first button of the footer in that mode. No hace falta leer esto
     para cambiar el mensaje: it only moves the focus. */
  useEffect(() => {
    if (footerMode === 'confirmDelete' || footerMode === 'confirmStatus') {
      formRef.current?.lastElementChild?.querySelector('button')?.focus()
    }
  }, [footerMode])

  function handleFieldChange(name, value) {
    // Choosing a parent brings its epic (and a story's sprint, for a task): see withParent.
    const nextValues = name === 'parentId' ? withParent(values, tickets, value) : { ...values, [name]: value }

    setValues(nextValues)
    setDirty(true)
    if (errors[name]) setErrors({ ...errors, [name]: validateTicketForm(nextValues)[name] })
  }

  function handleTypeFieldChange(name, value) {
    const nextValues = { ...values, typeFields: { ...values.typeFields, [name]: value } }
    setValues(nextValues)
    setDirty(true)
    if (errors[name]) setErrors({ ...errors, [name]: validateTicketForm(nextValues)[name] })
  }

  /* Ticking an item is the most frequent thing done here, so it saves at once and does not make
     the form dirty. What goes to the API is the SAVED ticket with only this list replaced: the
     rest of the draft waits for Guardar. If it fails, the tick goes back. */
  async function handleChecklistToggle(name, items) {
    const before = values.typeFields
    setValues({ ...values, typeFields: { ...values.typeFields, [name]: items } })
    setChecklistError(null)

    const saved = ticketToFormValues(ticket)
    try {
      await saveChecklist.mutateAsync({
        ticketId: ticket.id,
        values: { ...saved, typeFields: { ...saved.typeFields, [name]: items } },
      })
    } catch (err) {
      setValues((current) => ({ ...current, typeFields: before }))
      setChecklistError({ name, message: errorMessage(err) })
    }
  }

  /* Status is not part of the form: it saves on its own, through the API's rules, and a toast
     says so. A status with no way out under the workflow asks first, in the footer. If the API
     still says no, the reason shows next to the selector and the status stays as it was. */
  function handleStatusChange(nextStatus) {
    if (isFinalStatus(workflow, nextStatus)) {
      setPendingStatus(nextStatus)
      setFooterMode('confirmStatus')
      return
    }
    saveStatus(nextStatus)
  }

  async function saveStatus(nextStatus) {
    setStatusError('')
    try {
      await changeStatus.mutateAsync({ ticketId: ticket.id, status: nextStatus })
      toast.success(`${ticket.code} pasó a ${labelOf(nextStatus)}`)
    } catch (err) {
      setStatusError(errorMessage(err))
    }
    setFooterMode('edit')
  }

  /* The X, the backdrop and Escape all end up here. */
  function handleRequestClose() {
    if (submitting) return

    // Escape leaves the confirmation first, not the whole sheet.
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
    if (readOnly) return

    const found = validateTicketForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    try {
      await updateTicket.mutateAsync({
        ticketId: ticket.id,
        values: {
          ...values,
          /* `\s+` and not `trim()` alone: a line break pasted into the title has no place there. */
          title: values.title.replace(/\s+/g, ' ').trim(),
          description: values.description.trim(),
        },
      })
      toast.success(`${ticket.code} guardado`)
      onClose()
    } catch (err) {
      const fieldErrors = toFormErrors(err.fieldErrors, ticket.type)
      if (Object.keys(fieldErrors).length > 0) setErrors({ ...found, ...fieldErrors })
      else setFormError(errorMessage(err))
    }
  }

  async function handleDelete() {
    setFormError('')
    try {
      await deleteTicket.mutateAsync(ticket.id)
      toast.success(
        ticket.descendantCount > 0
          ? `${ticket.code} y ${ticket.descendantCount} ${ticket.descendantCount === 1 ? 'hijo borrados' : 'hijos borrados'}`
          : `${ticket.code} borrado`,
      )
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
      setFooterMode('edit')
    }
  }

  return (
    <Modal isOpen onClose={handleRequestClose} size="lg">
      <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        {/* The visible title is an editable field, so the dialog also carries a real heading. */}
        <h2 className="sr-only">
          {ticket.code}: {ticket.title}
        </h2>
        <DetailHeader
          leading={<TicketTypeIcon type={ticket.type} className="size-4.5" />}
          code={ticket.code}
          badge={status && <Badge tone={status.tone}>{status.label}</Badge>}
          deleteLabel="Borrar ticket"
          disabled={submitting}
          onDelete={canDelete && !epicClosed ? () => setFooterMode('confirmDelete') : undefined}
          onCopied={(code) => toast.success(`${code} copiado`)}
          onClose={handleRequestClose}
        />

        <DetailLayout
          side={
            <TicketSideFields
              ticket={ticket}
              values={values}
              errors={errors}
              readOnly={readOnly}
              submitting={submitting}
              workflow={workflow}
              epics={epics}
              sprints={sprints}
              members={members}
              tickets={tickets}
              statusError={statusError}
              changingStatus={changeStatus.isPending}
              context={context}
              onFieldChange={handleFieldChange}
              onTypeFieldChange={handleTypeFieldChange}
              onStatusChange={handleStatusChange}
            />
          }
        >
          {/* Inside the main column, like the epic's: above the columns it ran the full width
              and the side column started glued under it. */}
          {epicClosed && (
            <Banner tone="warning" icon={Lock} title="Épica cerrada">
              Reabrila para hacer cambios en sus tickets.
            </Banner>
          )}

          <TicketTitle
            ticket={ticket}
            value={values.title}
            readOnly={readOnly}
            disabled={submitting}
            error={errors.title}
            onChange={(value) => handleFieldChange('title', value)}
          />

          {ticket.parentCode && (
            <p className="-mt-2 text-footnote text-label-secondary">
              Cuelga de <span className="mono">{ticket.parentCode}</span> · {ticket.parentTitle}
            </p>
          )}

          <TicketDescription
            ticket={ticket}
            value={values.description}
            readOnly={readOnly}
            disabled={submitting}
            onChange={(value) => handleFieldChange('description', value)}
          />

          <TicketTypeFields
            type={ticket.type}
            values={values.typeFields}
            onChange={handleTypeFieldChange}
            disabled={submitting}
            readOnly={readOnly}
            idPrefix={`ticket-${ticket.id}`}
            errors={errors}
            onChecklistToggle={handleChecklistToggle}
            checklistError={checklistError}
          />

          <TicketChildren ticket={ticket} tickets={tickets} sprints={sprints} />

          {/* A closed ticket takes no new children (the API refuses them too). */}
          {onCreateChild && editable && isOpenStatus(ticket.status) && (
            <ChildShortcuts ticket={ticket} disabled={submitting} onCreateChild={onCreateChild} />
          )}
        </DetailLayout>

        {readOnly && footerMode === 'edit' ? (
          <div className={FOOTER}>
            {formError && <p role="alert" className="mr-auto text-footnote text-red-text">{formError}</p>}
            <Button variant="ghost" onClick={onClose} className="ml-auto">
              Cerrar
            </Button>
          </div>
        ) : (
          <DetailFooter
            mode={footerMode}
            error={formError}
            submitting={submitting}
            confirmDeleteMessage={deleteMessage(ticket)}
            confirmStatusMessage={`${ticket.code} va a pasar a ${labelOf(pendingStatus)} y el workflow no permite volver atrás.`}
            changingStatus={changeStatus.isPending}
            onExitConfirm={() => setFooterMode('edit')}
            onDelete={handleDelete}
            onCancel={handleRequestClose}
            onDiscard={onClose}
            onConfirmStatus={() => saveStatus(pendingStatus)}
          />
        )}
      </form>
    </Modal>
  )
}
