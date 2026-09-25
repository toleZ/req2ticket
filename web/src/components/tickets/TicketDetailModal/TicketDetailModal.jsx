import { useState } from 'react'

import { TicketExtraFields } from '@/components/tickets/TicketExtraFields/TicketExtraFields'
import { SHEET_LABEL } from '@/components/tickets/TicketExtraFields/TicketExtraFields.styles'
import { TicketPointsField } from '@/components/tickets/TicketPointsField/TicketPointsField'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Badge } from '@/components/ui/Badge/Badge'
import { DetailFooter } from '@/components/ui/DetailFooter/DetailFooter'
import { DetailHeader } from '@/components/ui/DetailHeader/DetailHeader'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { DetailRow } from '@/components/ui/DetailRow/DetailRow'
import { DetailSelect } from '@/components/ui/DetailRow/DetailSelect'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { Modal } from '@/components/ui/Modal/Modal'
import { SearchSelect } from '@/components/ui/SearchSelect/SearchSelect'
import { formatDateTime, timeAgo } from '@/lib/dates'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import { epicPickerOptions, sprintPickerOptions, userPickerOptions } from '@/lib/pickerOptions'
import {
  DESCRIPTION_PLACEHOLDER,
  EXTRA_FIELDS,
  toExtraFieldsPayload,
  toFormValues,
} from '@/lib/ticketExtraFields'
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'
import { validateTicketForm } from '@/lib/validate'
import { CONTROL_TEXTAREA, META, STORY_CALLOUT, STORY_TEXTAREA, TYPE_VALUE } from './TicketDetailModal.styles'
import { toDetailValues } from './TicketDetailModal.helpers'
/**
 * A ticket's record: everything it holds, on a two-column sheet, and the only place it is
 * edited from.
 *
 * It is a form with a Save button, not a panel that saves field by field. What you type lives
 * in local state until Guardar is pressed; the modal only closes if the PUT succeeded, the
 * same as the create modals.
 *
 * The left column changes with the type (story, task, bug or fix) because the field list comes
 * from EXTRA_FIELDS. The two that are `select`s — a bug's severity, a fix's regression risk —
 * are drawn on the right, with the status and the priority: they are metadata, not content,
 * and that is where they read.
 *
 * It takes no `isOpen`: the page mounts it when you pick a ticket and unmounts it on close.
 * That is what lets the form be seeded in useState and then forgotten — every opening is a
 * fresh mount, so no state from the previous ticket is ever left over. The alternative
 * (leaving it mounted with an `isOpen`) forces resyncing the form by hand every time the
 * ticket changes, and syncing state with props from an effect is exactly what React advises
 * against and what the project's eslint rejects (react-hooks/set-state-in-effect).
 *
 * Unmounting would also skip Modal's exit animation, so each page wraps this sheet in an
 * <AnimatePresence> and Modal propagates that exit: the sheet closes the way it opened.
 */
export function TicketDetailModal({
  ticket,
  epics,
  sprints,
  users,
  onClose,
  onUpdateTicket,
  onDeleteTicket,
}) {
  const [values, setValues] = useState(() => toDetailValues(ticket))
  /* The extra fields go in their own object and not inside `values`: they are the only ones
     that depend on the type, and toFormValues already returns exactly this shape. */
  const [extras, setExtras] = useState(() => toFormValues(ticket.type, ticket.extraFields))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  /* A tick saves on its own (see handleChecklistToggle): the error of the last one that
     failed, shown under that checklist. */
  const [checklistError, setChecklistError] = useState(null)

  /* The footer has three faces: the normal one, the "are you sure you want to delete it?" and
     the "you have unsaved changes". All three live here and not in a ConfirmModal on top,
     because two modals at once are two live useFocusTraps, and that hook listens for Escape on
     `document`: one key press would close both. Swapping the footer has no such problem, and
     it does not cover up what you are about to lose. */
  const [footerMode, setFooterMode] = useState('edit')

  const type = findOption(TICKET_TYPE_OPTIONS, ticket.type)
  const status = findOption(TICKET_STATUS_OPTIONS, values.status)

  /* The extra fields split in two: the content on the left, the dropdowns on the right. It
     filters by `kind` and not by a list of names so that a new field in
     lib/ticketExtraFields.js lands in the right column on its own. */
  const sideFields = (EXTRA_FIELDS[ticket.type] || []).filter((field) => field.kind === 'select')

  /* A boolean is enough: comparing the whole objects against an initial copy would catch the
     case of typing something and deleting it again, which is not worth the trouble. Setting to
     true something already true redraws nothing — React bails out if the value is the same. */
  function markDirty() {
    setDirty(true)
  }

  function handleChange(e) {
    handleFieldChange(e.target.name, e.target.value)
  }

  function handleFieldChange(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    markDirty()

    // If the field already had an error, it is re-checked as you type so the message
    // disappears as soon as you fix it. A field with no error yet is not validated until
    // submit.
    if (errors[name]) {
      setErrors({ ...errors, [name]: validateTicketForm(nextValues)[name] })
    }
  }

  function handlePointsChange(points) {
    setValues({ ...values, points })
    markDirty()
  }

  function handleExtraChange(name, value) {
    setExtras({ ...extras, [name]: value })
    markDirty()
  }

  /* Ticking an item is the most frequent thing done in this sheet, so it saves right away
     instead of waiting for "Guardar cambios" — and it does not make the form dirty.

     What goes to the API is the SAVED ticket (the `ticket` prop, not the form) with only this
     checklist replaced: whatever else is being edited stays a draft until Guardar. If the
     save fails the tick is undone and the error appears under the checklist.

     The list is not disabled while it saves: every save sends the whole checklist as it is on
     screen, so a second quick tick simply goes out in the next request. Disabling it dimmed
     every row for the length of the request, which read as a flash. */
  async function handleChecklistToggle(name, items) {
    const before = extras
    setExtras({ ...extras, [name]: items })
    setChecklistError(null)
    try {
      const saved = toFormValues(ticket.type, ticket.extraFields)
      await onUpdateTicket(ticket, {
        extraFields: toExtraFieldsPayload(ticket.type, { ...saved, [name]: items }),
      })
    } catch (err) {
      setExtras(before)
      setChecklistError({ name, message: errorMessage(err) })
    }
  }

  /* All three ways out go through here: the X, the click on the backdrop and Escape — all
     three end up in the `onClose` that <Modal> receives. */
  function handleRequestClose() {
    // With the PUT in flight, closing would leave the list stale and with no idea whether it saved.
    if (submitting) return

    // Escape leaves the confirmation first, not the whole modal.
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

    const found = validateTicketForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      /* `type`, `parentId` and `reporterId` are deliberately absent from the patch:
         updateTicket merges it over the whole ticket, so they travel untouched. The type is
         also rejected by the API — the ticket's code carries its prefix. */
      await onUpdateTicket(ticket, {
        /* `\s+` and not `trim()` alone: a line break pasted from the clipboard is the only one
           that can get in (Enter is blocked), and it has no place in a title. */
        title: values.title.replace(/\s+/g, ' ').trim(),
        description: values.description.trim(),
        epicId: values.epicId,
        priority: values.priority,
        status: values.status,
        points: values.points,
        assigneeId: values.assigneeId,
        sprintId: values.sprintId,
        extraFields: toExtraFieldsPayload(ticket.type, extras),
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
      // The page removes the ticket from the list, and with that this modal goes on its own.
      await onDeleteTicket(ticket)
    } catch (err) {
      setFormError(errorMessage(err))
      setFooterMode('edit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={handleRequestClose}
      size="lg"
      ariaLabel={`${ticket.code}: ${ticket.title}`}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        {/* The sheet's visible title is an editable field, so the dialog also carries a real
            heading for anyone moving through it by headings. Visible only to screen readers. */}
        <h2 className="sr-only">
          {ticket.code}: {ticket.title}
        </h2>
        <DetailHeader
          leading={<TicketTypeIcon type={ticket.type} className="size-4.5" />}
          code={ticket.code}
          badge={status && <Badge tone={status.tone}>{status.label}</Badge>}
          deleteLabel="Eliminar ticket"
          disabled={submitting}
          onDelete={() => setFooterMode('confirmDelete')}
          onClose={handleRequestClose}
        />

        <DetailLayout
          side={
            <>
              {/* The type is not a select: it is assigned on create and the API refuses it
                  afterwards, because the code carries its prefix (UH-, TASK-, BUG-, FIX-) and a
                  ticket that changed type would be left with a code that lies. Converting one
                  means creating another ticket. */}
              <DetailRow label="Tipo">
                <span
                  title="El tipo se define al crear el ticket y no se puede cambiar."
                  className={TYPE_VALUE}
                >
                  <TicketTypeIcon type={ticket.type} className="size-4" />
                  {type && type.label}
                </span>
              </DetailRow>

              <DetailRow label="Estado" htmlFor={`ticket-${ticket.id}-status`}>
                <DetailSelect
                  id={`ticket-${ticket.id}-status`}
                  name="status"
                  value={values.status}
                  disabled={submitting}
                  onChange={handleChange}
                >
                  {TICKET_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </DetailSelect>
              </DetailRow>

              <DetailRow label="Prioridad" htmlFor={`ticket-${ticket.id}-priority`}>
                <DetailSelect
                  id={`ticket-${ticket.id}-priority`}
                  name="priority"
                  value={values.priority}
                  disabled={submitting}
                  onChange={handleChange}
                >
                  {TICKET_PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </DetailSelect>
              </DetailRow>

              {/* The dropdowns belonging to the type: a bug's severity, a fix's regression risk.
                  They come from EXTRA_FIELDS just like the ones on the left, so a new type with
                  its own enum shows up here without touching this file. */}
              {sideFields.map((field) => (
                <DetailRow
                  key={field.name}
                  label={field.label}
                  htmlFor={`ticket-${ticket.id}-${field.name}`}
                >
                  <DetailSelect
                    id={`ticket-${ticket.id}-${field.name}`}
                    value={extras[field.name]}
                    disabled={submitting}
                    onChange={(e) => handleExtraChange(field.name, e.target.value)}
                  >
                    <option value="">Sin definir</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </DetailSelect>
                </DetailRow>
              ))}

              <DetailRow label="Épica" htmlFor={`ticket-${ticket.id}-epic`}>
                <div className="w-full min-w-0">
                  <SearchSelect
                    id={`ticket-${ticket.id}-epic`}
                    value={values.epicId}
                    options={epicPickerOptions(epics)}
                    searchLabel="Buscar épica"
                    noResults="Ninguna épica coincide"
                    disabled={submitting}
                    onChange={(value) => handleFieldChange('epicId', value)}
                  />
                </div>
              </DetailRow>

              <DetailRow label="Sprint" htmlFor={`ticket-${ticket.id}-sprint`}>
                <div className="w-full min-w-0">
                  <SearchSelect
                    id={`ticket-${ticket.id}-sprint`}
                    value={values.sprintId}
                    options={sprintPickerOptions(sprints, 'Sin sprint')}
                    searchLabel="Buscar sprint"
                    noResults="Ningún sprint coincide"
                    disabled={submitting}
                    onChange={(value) => handleFieldChange('sprintId', value)}
                  />
                </div>
              </DetailRow>

              <DetailRow label="Asignado" htmlFor={`ticket-${ticket.id}-assignee`}>
                <div className="w-full min-w-0">
                  <SearchSelect
                    id={`ticket-${ticket.id}-assignee`}
                    value={values.assigneeId}
                    options={userPickerOptions(users, 'Sin asignar')}
                    searchLabel="Buscar persona"
                    noResults="Nadie coincide"
                    disabled={submitting}
                    onChange={(value) => handleFieldChange('assigneeId', value)}
                  />
                </div>
              </DetailRow>

              {/* The points are stacked and not in a detail row: seven buttons do not fit next
                  to a label in a 320px column. */}
              <div className="py-1">
                <p className="mb-1 text-footnote text-label-secondary">Puntos</p>
                <TicketPointsField
                  id={`ticket-${ticket.id}-points`}
                  value={values.points}
                  disabled={submitting}
                  onChange={handlePointsChange}
                />
              </div>

              {/* The only thing the modal shows and does not let you edit.

                  Masculine in Spanish, and not "Abierta por / Creada" as in the design: there the
                  example was a story, but this same modal also draws the task, the bug and the
                  fix.

                  `reporterName` can come back null. The API fills it with whoever created the
                  ticket, but until recently every PUT wiped it (see the comment in
                  lib/api/tickets.js), so tickets saved before that fix were left with no
                  reporter. */}
              <div className={META}>
                <p>Reportado por {ticket.reporterName ?? 'alguien que ya no está registrado'}</p>
                <p title={formatDateTime(ticket.createdAt)}>Creado {timeAgo(ticket.createdAt)}</p>
                <p title={formatDateTime(ticket.updatedAt)}>
                  Actualizado {timeAgo(ticket.updatedAt)}
                </p>
              </div>
            </>
          }
        >
          <InlineTitleField
            name="title"
            ariaLabel="Título"
            value={values.title}
            disabled={submitting}
            error={errors.title}
            onChange={handleChange}
          />

          {/* The story goes in a callout of its own, as in the design. It is the same
              `description` field the other types use: the "Como… quiero… para…" narrative
              stopped being three fields and is free text, so the grey of the connectors
              survives where it can — in the placeholder, already drawn in label-tertiary. */}
          {ticket.type === 'userStory' ? (
            <div className={STORY_CALLOUT}>
              <label
                htmlFor={`ticket-${ticket.id}-description`}
                className={cn(SHEET_LABEL, 'text-blue-text')}
              >
                Historia
              </label>
              <textarea
                id={`ticket-${ticket.id}-description`}
                rows={3}
                name="description"
                value={values.description}
                disabled={submitting}
                onChange={handleChange}
                placeholder={DESCRIPTION_PLACEHOLDER.userStory}
                className={STORY_TEXTAREA}
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor={`ticket-${ticket.id}-description`}
                className={cn(SHEET_LABEL, 'text-label-secondary')}
              >
                Descripción
              </label>
              <textarea
                id={`ticket-${ticket.id}-description`}
                name="description"
                rows={3}
                value={values.description}
                disabled={submitting}
                onChange={handleChange}
                className={CONTROL_TEXTAREA}
              />
            </div>
          )}

          <TicketExtraFields
            type={ticket.type}
            values={extras}
            onChange={handleExtraChange}
            disabled={submitting}
            idPrefix={`ticket-${ticket.id}`}
            kinds={['text', 'textarea', 'checklist']}
            onChecklistToggle={handleChecklistToggle}
            checklistError={checklistError}
          />
        </DetailLayout>

        <DetailFooter
          mode={footerMode}
          error={formError}
          submitting={submitting}
          confirmDeleteMessage="¿Eliminar este ticket? No se puede deshacer."
          onExitConfirm={() => setFooterMode('edit')}
          onDelete={handleDelete}
          onCancel={handleRequestClose}
          onDiscard={onClose}
        />
      </form>
    </Modal>
  )
}
