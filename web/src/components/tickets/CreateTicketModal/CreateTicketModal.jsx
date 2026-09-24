import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { SHEET_LABEL, TicketExtraFields } from '@/components/tickets/TicketExtraFields/TicketExtraFields'
import { TicketPointsField } from '@/components/tickets/TicketPointsField/TicketPointsField'
import { TYPE_ICONS } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon.data'
import {
  CONTROL_TEXTAREA,
  STORY_CALLOUT,
  STORY_TEXTAREA,
} from '@/components/tickets/TicketDetailModal/TicketDetailModal.styles'
import { Avatar } from '@/components/ui/Avatar/Avatar'
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
import { getUsers } from '@/lib/api'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS } from '@/lib/epicOptions'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import { SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import {
  DESCRIPTION_PLACEHOLDER,
  EXTRA_FIELDS,
  TYPE_INTRO,
  emptyExtras,
  toExtraFieldsPayload,
} from '@/lib/ticketExtraFields'
import {
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
  TICKET_TYPE_OPTIONS,
} from '@/lib/ticketOptions'
import { validateTicketForm } from '@/lib/validate'

const INITIAL_TYPE = 'userStory'

const INITIAL_VALUES = {
  type: INITIAL_TYPE,
  title: '',
  description: '',
  epicId: '',
  priority: 'medium',
  status: 'todo',
  points: '',
  assigneeId: '',
  sprintId: '',
}

const FIELD_IDS = { title: 'ticket-title', epicId: 'ticket-epic' }

const TYPE_SEGMENTS = TICKET_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.value === 'userStory' ? 'Historia' : option.label,
  icon: TYPE_ICONS[option.value],
}))

const CREATE_LABEL = {
  userStory: 'Crear historia',
  task: 'Crear tarea',
  bug: 'Crear bug',
  fix: 'Crear fix',
}

const SIDE_LABEL = cn(SHEET_LABEL, 'text-label-secondary')

const REQUIRED = (
  <>
    <span className="text-red-text" aria-hidden="true">
      {' *'}
    </span>
    <span className="sr-only"> (obligatorio)</span>
  </>
)

/**
 * The create sheet. It has the detail sheet's shape — content on the left, metadata on the
 * right — and changes with the type chosen in its header: a story's three checklists, a
 * task's checklist, what it takes to reproduce a bug, what a fix changed.
 */
export function CreateTicketModal({ isOpen, onClose, onCreate, epics, sprints }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [extras, setExtras] = useState(emptyExtras(INITIAL_TYPE))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!isOpen) return

    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [isOpen])

  const type = values.type
  const sideFields = EXTRA_FIELDS[type].filter((field) => field.kind === 'select')

  const epicOptions = epics.map((epic) => {
    const accent = findOption(ACCENT_COLORS, epic.accentColor)
    return {
      value: String(epic.id),
      label: epic.name,
      leading: (
        <span
          className={cn('size-2 shrink-0 rounded-full', accent ? accent.dotClass : 'bg-gray')}
          aria-hidden="true"
        />
      ),
    }
  })

  const sprintOptions = [
    { value: '', label: 'Sin sprint (backlog)' },
    ...sprints.map((sprint) => ({
      value: String(sprint.id),
      label: sprint.name,
      hint: findOption(SPRINT_STATUS_OPTIONS, sprint.status)?.label,
    })),
  ]

  const assigneeOptions = [
    { value: '', label: 'Sin asignar' },
    ...users.map((user) => ({
      value: String(user.id),
      label: user.name,
      leading: <Avatar name={user.name} size="sm" />,
    })),
  ]

  function setField(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)

    if (errors[name]) {
      setErrors({ ...errors, [name]: validateTicketForm(nextValues)[name] })
    }
  }

  function handleChange(e) {
    setField(e.target.name, e.target.value)
  }

  /* A type's fields do not exist on another, so switching type starts them empty. */
  function handleTypeChange(nextType) {
    setValues({ ...values, type: nextType })
    setExtras(emptyExtras(nextType))
  }

  function handleExtraChange(name, value) {
    setExtras({ ...extras, [name]: value })
  }

  function reset() {
    setValues(INITIAL_VALUES)
    setExtras(emptyExtras(INITIAL_TYPE))
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
    setSubmitting(true)
    try {
      await onCreate({
        ...values,
        title: values.title.replace(/\s+/g, ' ').trim(),
        description: values.description.trim(),
        extraFields: toExtraFieldsPayload(type, extras),
      })
      reset()
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" ariaLabel="Nuevo ticket">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col md:h-[min(44rem,calc(100dvh_-_2rem))] md:flex-none"
        noValidate
      >
        <h2 className="sr-only">Nuevo ticket</h2>

        <div className={HEADER}>
          <SegmentedField
            name="type"
            legend="Tipo de ticket"
            options={TYPE_SEGMENTS}
            value={type}
            disabled={submitting}
            onChange={handleTypeChange}
            className="w-full max-w-md"
          />
          <div className="ml-auto">
            <IconButton label="Cerrar" onClick={handleClose} disabled={submitting}>
              <X className="size-4.5" aria-hidden="true" />
            </IconButton>
          </div>
        </div>

        <DetailLayout
          side={
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="ticket-status" className={SIDE_LABEL}>
                  Estado
                </label>
                <DetailSelect
                  id="ticket-status"
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
              </div>

              <div>
                <label htmlFor="ticket-priority" className={SIDE_LABEL}>
                  Prioridad
                </label>
                <DetailSelect
                  id="ticket-priority"
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
              </div>

              {sideFields.map((field) =>
                field.options.length <= 3 ? (
                  <div key={field.name}>
                    <p className={SIDE_LABEL}>{field.label}</p>
                    <SegmentedField
                      name={`ticket-${field.name}`}
                      legend={field.label}
                      options={field.options}
                      value={extras[field.name]}
                      disabled={submitting}
                      onChange={(value) => handleExtraChange(field.name, value)}
                    />
                  </div>
                ) : (
                  <div key={field.name}>
                    <label htmlFor={`ticket-${field.name}`} className={SIDE_LABEL}>
                      {field.label}
                    </label>
                    <DetailSelect
                      id={`ticket-${field.name}`}
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
                  </div>
                ),
              )}

              <div>
                <p className={SIDE_LABEL}>Puntos</p>
                <TicketPointsField
                  id="ticket-points"
                  value={values.points}
                  disabled={submitting}
                  onChange={(points) => setValues({ ...values, points })}
                />
              </div>

              <div className="hairline-t pt-4">
                <label htmlFor="ticket-epic" className={SIDE_LABEL}>
                  Épica{REQUIRED}
                </label>
                <SearchSelect
                  id="ticket-epic"
                  value={values.epicId}
                  options={epicOptions}
                  placeholder="Elegí una épica"
                  searchLabel="Buscar épica"
                  noResults="Ninguna épica coincide"
                  disabled={submitting}
                  error={errors.epicId}
                  onChange={(value) => setField('epicId', value)}
                />
                {errors.epicId && (
                  <p id="ticket-epic-error" className="mt-1 text-footnote text-red-text">
                    {errors.epicId}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ticket-sprint" className={SIDE_LABEL}>
                  Sprint
                </label>
                <SearchSelect
                  id="ticket-sprint"
                  value={values.sprintId}
                  options={sprintOptions}
                  searchLabel="Buscar sprint"
                  noResults="Ningún sprint coincide"
                  disabled={submitting}
                  onChange={(value) => setField('sprintId', value)}
                />
              </div>

              <div>
                <label htmlFor="ticket-assignee" className={SIDE_LABEL}>
                  Asignado a
                </label>
                <SearchSelect
                  id="ticket-assignee"
                  value={values.assigneeId}
                  options={assigneeOptions}
                  searchLabel="Buscar persona"
                  noResults="Nadie coincide"
                  disabled={submitting}
                  onChange={(value) => setField('assigneeId', value)}
                />
              </div>
            </div>
          }
        >
          <div>
            <label htmlFor="ticket-title" className={SIDE_LABEL}>
              Título{REQUIRED}
            </label>
            <InlineTitleField
              id="ticket-title"
              name="title"
              ariaLabel="Título"
              placeholder="Título del ticket"
              required
              value={values.title}
              disabled={submitting}
              error={errors.title}
              onChange={handleChange}
            />
            <p className="mt-1 text-footnote text-label-secondary">{TYPE_INTRO[type]}</p>
          </div>

          {type === 'userStory' ? (
            <div className={STORY_CALLOUT}>
              <label htmlFor="ticket-description" className={cn(SHEET_LABEL, 'text-blue-text')}>
                Historia
              </label>
              <textarea
                id="ticket-description"
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
              <label htmlFor="ticket-description" className={SIDE_LABEL}>
                Descripción
              </label>
              <textarea
                id="ticket-description"
                rows={3}
                name="description"
                value={values.description}
                disabled={submitting}
                onChange={handleChange}
                placeholder={DESCRIPTION_PLACEHOLDER[type]}
                className={CONTROL_TEXTAREA}
              />
            </div>
          )}

          <TicketExtraFields
            type={type}
            values={extras}
            onChange={handleExtraChange}
            disabled={submitting}
            idPrefix="ticket-nuevo"
            kinds={['text', 'textarea', 'checklist']}
          />
        </DetailLayout>

        <div className={FOOTER}>
          {formError ? (
            <p role="alert" className="mr-auto text-footnote text-red-text">
              {formError}
            </p>
          ) : (
            <p className="mr-auto text-caption text-label-secondary">
              <span className="text-red-text" aria-hidden="true">
                *
              </span>{' '}
              Obligatorio
            </p>
          )}
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : CREATE_LABEL[type]}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
