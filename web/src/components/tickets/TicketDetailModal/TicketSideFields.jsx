import { TicketPointsField } from '@/components/tickets/TicketPointsField/TicketPointsField'
import { epicsForTicket, parentPickerOptions, sprintsForTicket } from '@/components/tickets/TicketPickers/TicketPickers'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { DetailRow } from '@/components/ui/DetailRow/DetailRow'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { Select } from '@/components/ui/Select/Select'
import { epicPickerOptions, sprintPickerOptions, toneOptions, userPickerOptions } from '@/components/ui/Select/Select.options'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { formatDateTime, timeAgo } from '@/lib/dates'
import { findOption, TICKET_PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/options'
import { HAS_POINTS, PARENT_TYPES, TYPE_SELECT } from '@/lib/ticketTypes'
import { isFinalStatus } from '@/lib/workflow'
import { statusOf, statusOptions } from './TicketDetailModal.helpers'
import { META, TYPE_VALUE } from './TicketDetailModal.styles'

/**
 * The side column of a ticket's sheet: type, status, priority, the type's own dropdown, epic,
 * parent, sprint, assignee, points, and who reported it and when.
 *
 * No state of its own: the sheet owns the form (`values`, `errors`) and passes the changes up.
 * Status is the exception — it is not part of the form and saves on its own (`onStatusChange`).
 * `epics`, `sprints`, `members` and `tickets` are the project's lists, for the pickers.
 */
export function TicketSideFields({
  ticket,
  values,
  errors,
  readOnly,
  submitting,
  workflow,
  epics,
  sprints,
  members,
  tickets,
  statusError,
  changingStatus,
  onFieldChange,
  onTypeFieldChange,
  onStatusChange,
}) {
  const id = (name) => `ticket-${ticket.id}-${name}`
  const type = findOption(TICKET_TYPE_OPTIONS, ticket.type)
  const status = statusOf(ticket.status)
  const finalStatus = isFinalStatus(workflow, ticket.status)
  const typeSelect = TYPE_SELECT[ticket.type]
  const hasParent = PARENT_TYPES[ticket.type].length > 0

  // toneOptions adds each status's dot; the reason a status is off rides along from statusOptions.
  const statusChoices = statusOptions(ticket, workflow)
  const statusSelectOptions = toneOptions(statusChoices).map((option, index) => ({
    ...option,
    disabled: statusChoices[index].disabled,
    description: statusChoices[index].description,
  }))

  return (
    <>
      {/* The type is not a select: the code carries its prefix, and a ticket that changed type
          would carry a code that lies. Converting one means creating another. */}
      <DetailRow label="Tipo">
        <Tooltip label="Para cambiar el tipo, creá un ticket nuevo" side="bottom" align="end">
          <span className={TYPE_VALUE} tabIndex={0}>
            <TicketTypeIcon type={ticket.type} className="size-4" />
            {type && type.label}
          </span>
        </Tooltip>
      </DetailRow>

      <DetailRow label="Estado" htmlFor={id('status')}>
        <div className="w-full min-w-0">
          {finalStatus || readOnly ? (
            <ReadOnlyValue id={id('status')}>
              {status?.label}
              {finalStatus && <span className="text-label-secondary"> · Estado final</span>}
            </ReadOnlyValue>
          ) : (
            <Select
              id={id('status')}
              value={ticket.status}
              options={statusSelectOptions}
              disabled={changingStatus}
              error={statusError}
              onChange={onStatusChange}
            />
          )}
          {statusError && <p role="alert" className="mt-1 text-footnote text-red-text">{statusError}</p>}
        </div>
      </DetailRow>

      <DetailRow label="Prioridad" htmlFor={id('priority')}>
        <div className="w-full min-w-0">
          <Select
            id={id('priority')}
            value={values.priority}
            options={toneOptions(TICKET_PRIORITY_OPTIONS)}
            readOnly={readOnly}
            disabled={submitting}
            onChange={(value) => onFieldChange('priority', value)}
          />
        </div>
      </DetailRow>

      {/* The type's own dropdown: a bug's severity, a fix's regression risk. */}
      {typeSelect && (
        <DetailRow label={typeSelect.label} htmlFor={id(typeSelect.name)}>
          <div className="w-full min-w-0">
            <Select
              id={id(typeSelect.name)}
              value={values.typeFields[typeSelect.name] ?? ''}
              options={toneOptions(typeSelect.options)}
              readOnly={readOnly}
              disabled={submitting}
              onChange={(value) => onTypeFieldChange(typeSelect.name, value)}
            />
          </div>
        </DetailRow>
      )}

      <DetailRow label="Épica" htmlFor={id('epic')}>
        <div className="w-full min-w-0">
          <Select
            id={id('epic')}
            value={String(values.epicId)}
            options={epicPickerOptions(epicsForTicket(epics, ticket.epicId))}
            searchable
            searchLabel="Buscar épica"
            noResults="Ninguna épica abierta coincide"
            readOnly={readOnly}
            disabled={submitting}
            onChange={(value) => onFieldChange('epicId', value)}
          />
        </div>
      </DetailRow>

      {hasParent && (
        <DetailRow label={ticket.type === 'fix' ? 'Bug' : 'Historia'} htmlFor={id('parent')}>
          <div className="w-full min-w-0">
            <Select
              id={id('parent')}
              value={String(values.parentId)}
              options={parentPickerOptions(
                tickets,
                { type: ticket.type, epicId: values.epicId, ticketId: ticket.id },
                ticket.type === 'fix' ? undefined : 'Ninguna',
              )}
              placeholder="Elegí un ticket"
              searchable
              searchLabel="Buscar ticket"
              noResults="Ninguno en esta épica"
              readOnly={readOnly}
              disabled={submitting}
              error={errors.parentId}
              onChange={(value) => onFieldChange('parentId', value)}
            />
            {errors.parentId && <p className="mt-1 text-footnote text-red-text">{errors.parentId}</p>}
          </div>
        </DetailRow>
      )}

      <DetailRow label="Sprint" htmlFor={id('sprint')}>
        <div className="w-full min-w-0">
          <Select
            id={id('sprint')}
            value={String(values.sprintId)}
            options={sprintPickerOptions(sprintsForTicket(sprints, ticket.sprintId), 'Sin sprint')}
            searchable
            searchLabel="Buscar sprint"
            noResults="Ningún sprint coincide"
            readOnly={readOnly}
            disabled={submitting}
            onChange={(value) => onFieldChange('sprintId', value)}
          />
        </div>
      </DetailRow>

      <DetailRow label="Asignado" htmlFor={id('assignee')}>
        <div className="w-full min-w-0">
          <Select
            id={id('assignee')}
            value={String(values.assigneeId)}
            options={userPickerOptions(members, 'Sin asignar')}
            searchable
            searchLabel="Buscar persona"
            noResults="Nadie coincide"
            readOnly={readOnly}
            disabled={submitting}
            onChange={(value) => onFieldChange('assigneeId', value)}
          />
        </div>
      </DetailRow>

      {/* Stacked and not in a row: seven buttons do not fit next to a label. */}
      {HAS_POINTS[ticket.type] && (
        <div className="py-1">
          <p className="mb-1 text-footnote text-label-secondary">Puntos</p>
          <TicketPointsField
            id={id('points')}
            value={String(values.points)}
            readOnly={readOnly}
            disabled={submitting}
            onChange={(points) => onFieldChange('points', points)}
          />
        </div>
      )}

      <div className={META}>
        <p>Reportado por {ticket.reporterName ?? 'alguien que ya no está registrado'}</p>
        <p title={formatDateTime(ticket.createdAt)}>Creado {timeAgo(ticket.createdAt)}</p>
        <p title={formatDateTime(ticket.updatedAt)}>Actualizado {timeAgo(ticket.updatedAt)}</p>
      </div>
    </>
  )
}
