import { useState } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'

import { withParent } from '@/components/tickets/TicketPickers/TicketPickers'
import { TicketTypeFields } from '@/components/tickets/TicketTypeFields/TicketTypeFields'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Button } from '@/components/ui/Button/Button'
import { FOOTER } from '@/components/ui/DetailFooter/DetailFooter.styles'
import { HEADER } from '@/components/ui/DetailHeader/DetailHeader.styles'
import { DetailLayout } from '@/components/ui/DetailLayout/DetailLayout'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Modal } from '@/components/ui/Modal/Modal'
import { RequiredMark, RequiredNote } from '@/components/ui/SheetField/SheetField'
import { FIELD_ERROR, SHEET_TEXTAREA, SIDE_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { toast } from '@/components/ui/Toast/toast'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { useEpics } from '@/lib/queries/epics'
import { useMembers } from '@/lib/queries/members'
import { useSprints } from '@/lib/queries/sprints'
import { useCreateTicket, useTickets } from '@/lib/queries/tickets'
import { DESCRIPTION_PLACEHOLDER, HAS_POINTS, PARENT_TYPES, TYPE_INTRO, emptyTypeFields, toFormErrors } from '@/lib/ticketTypes'
import { validateTicketForm } from '@/lib/validate'
import { CREATE_LABEL, FIELD_IDS, NEW_TITLE, SWAP, initialValues } from './CreateTicketModal.data'
import { FORM, FORM_ERROR, TYPE_HEADING } from './CreateTicketModal.styles'
import { CreateTicketSideFields } from './CreateTicketSideFields'
import { CreateTicketTypeStep } from './CreateTicketTypeStep'

/**
 * The create sheet (ENT-2). It starts by asking the type, with four cards, because the type
 * decides every field that follows and it can never change afterwards. Then it has the detail
 * sheet's shape: content on the left, metadata on the right, and only that type's fields.
 *
 *     <CreateTicketModal projectId={projectId} isOpen={open} onClose={close} />
 *
 * `defaults` presets what a shortcut already knows: { type, parentId, epicId, sprintId } (from
 * a story's "Agregar tarea", a bug's "Crear fix"). With a type in `defaults` the cards are
 * skipped. The form is seeded from `defaults` when this mounts, so give it a `key` that changes
 * with them. `onCreated(ticket)` gets the new ticket's detail.
 *
 * The pieces live next to this file: CreateTicketTypeStep (the four cards) and
 * CreateTicketSideFields (the side column). This file keeps the form's state and the submit.
 */
export function CreateTicketModal({ projectId, isOpen, onClose, defaults, onCreated }) {
  const [values, setValues] = useState(() => initialValues(defaults))
  const [typeChosen, setTypeChosen] = useState(Boolean(defaults?.type))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const { data: epics = [] } = useEpics(projectId)
  const { data: sprints = [] } = useSprints(projectId)
  const { data: members = [] } = useMembers(projectId)
  const { data: tickets = [] } = useTickets(projectId)
  const createTicket = useCreateTicket(projectId)
  const submitting = createTicket.isPending
  const type = values.type

  function setField(name, value) {
    // Choosing a parent brings its epic (and a story's sprint, for a task): see withParent.
    const nextValues = name === 'parentId' ? withParent(values, tickets, value) : { ...values, [name]: value }

    setValues(nextValues)
    if (errors[name]) setErrors({ ...errors, [name]: validateTicketForm(nextValues)[name] })
  }

  function handleTypeFieldChange(name, value) {
    const nextValues = { ...values, typeFields: { ...values.typeFields, [name]: value } }
    setValues(nextValues)
    if (errors[name]) setErrors({ ...errors, [name]: validateTicketForm(nextValues)[name] })
  }

  /* A type's fields do not exist on another, so choosing a type starts them empty. A parent
     of the wrong type for the new choice is dropped too. */
  function chooseType(nextType) {
    setValues({
      ...values,
      type: nextType,
      typeFields: emptyTypeFields(nextType),
      points: HAS_POINTS[nextType] ? values.points : '',
      parentId: PARENT_TYPES[nextType].length > 0 ? values.parentId : '',
    })
    setErrors({})
    setTypeChosen(true)
  }

  function reset() {
    setValues(initialValues(defaults))
    setTypeChosen(Boolean(defaults?.type))
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
    const found = validateTicketForm(values)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }

    setFormError('')
    try {
      const ticket = await createTicket.mutateAsync({
        ...values,
        title: values.title.replace(/\s+/g, ' ').trim(),
        description: values.description.trim(),
      })
      toast.success(`${ticket.code} creado`)
      reset()
      onCreated?.(ticket)
      onClose()
    } catch (err) {
      // What the API refused field by field goes under each field; the rest, in the footer.
      const fieldErrors = toFormErrors(err.fieldErrors, type)
      if (Object.keys(fieldErrors).length > 0) setErrors({ ...found, ...fieldErrors })
      else setFormError(errorMessage(err))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      {!typeChosen ? (
        <CreateTicketTypeStep onChoose={chooseType} onClose={handleClose} />
      ) : (
        <form onSubmit={handleSubmit} className={FORM} noValidate>
          <div className={HEADER}>
            <TicketTypeIcon type={type} className="size-4.5" />
            <h2 className={TYPE_HEADING}>{NEW_TITLE[type]}</h2>
            {!defaults?.type && (
              <Button variant="ghost" size="sm" onClick={() => setTypeChosen(false)} disabled={submitting}>
                Cambiar tipo
              </Button>
            )}
            <IconButton label="Cerrar" onClick={handleClose} disabled={submitting}>
              <X className="size-4.5" aria-hidden="true" />
            </IconButton>
          </div>

          <DetailLayout
            side={
              <CreateTicketSideFields
                values={values}
                errors={errors}
                submitting={submitting}
                epics={epics}
                sprints={sprints}
                members={members}
                tickets={tickets}
                onFieldChange={setField}
                onTypeFieldChange={handleTypeFieldChange}
              />
            }
          >
            <motion.div {...SWAP} className="flex flex-col gap-5">
              <div>
                <label htmlFor="ticket-title" className={SIDE_LABEL}>
                  Título<RequiredMark />
                </label>
                {/* The same box as the description and the type's fields below it. */}
                <input
                  id="ticket-title"
                  placeholder="Título del ticket"
                  maxLength={160}
                  aria-required="true"
                  aria-invalid={errors.title ? true : undefined}
                  aria-describedby={errors.title ? 'ticket-title-error' : undefined}
                  value={values.title}
                  disabled={submitting}
                  onChange={(e) => setField('title', e.target.value)}
                  className={cn(SHEET_TEXTAREA, errors.title && 'border-red')}
                />
                {errors.title && (
                  <p id="ticket-title-error" role="alert" className={FIELD_ERROR}>
                    {errors.title}
                  </p>
                )}
                <p className="mt-1 text-footnote text-label-secondary">{TYPE_INTRO[type]}</p>
              </div>

              {/* A story's placeholder hints at its "Como <rol> quiero…" shape. */}
              <div>
                <label htmlFor="ticket-description" className={SIDE_LABEL}>
                  Descripción
                </label>
                <textarea
                  id="ticket-description"
                  rows={3}
                  maxLength={2000}
                  value={values.description}
                  disabled={submitting}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder={DESCRIPTION_PLACEHOLDER[type]}
                  className={SHEET_TEXTAREA}
                />
              </div>

              <TicketTypeFields
                type={type}
                values={values.typeFields}
                onChange={handleTypeFieldChange}
                disabled={submitting}
                idPrefix="ticket-nuevo"
                optional
                errors={errors}
              />
            </motion.div>
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
              {submitting ? 'Creando…' : CREATE_LABEL[type]}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
