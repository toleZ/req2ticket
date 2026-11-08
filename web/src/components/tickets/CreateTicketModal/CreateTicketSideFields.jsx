import { TicketPointsField } from '@/components/tickets/TicketPointsField/TicketPointsField'
import { epicsForTicket, parentPickerOptions, sprintsForTicket } from '@/components/tickets/TicketPickers/TicketPickers'
import { SegmentedField } from '@/components/ui/SegmentedField/SegmentedField'
import { Select } from '@/components/ui/Select/Select'
import { epicPickerOptions, sprintPickerOptions, toneOptions, userPickerOptions } from '@/components/ui/Select/Select.options'
import { RequiredMark } from '@/components/ui/SheetField/SheetField'
import { FIELD_ERROR, SIDE_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { TICKET_PRIORITY_OPTIONS } from '@/lib/options'
import { HAS_POINTS, PARENT_TYPES, TYPE_SELECT } from '@/lib/ticketTypes'

/**
 * The side column of the create sheet: priority, the type's own dropdown, points, epic, parent,
 * sprint and assignee. No state of its own: the sheet owns `values` and `errors`.
 *
 *   onFieldChange(name, value)       a common field (priority, epicId, parentId…)
 *   onTypeFieldChange(name, value)   the type's dropdown (a bug's severity, a fix's risk)
 */
export function CreateTicketSideFields({
  values,
  errors,
  submitting,
  epics,
  sprints,
  members,
  tickets,
  onFieldChange,
  onTypeFieldChange,
}) {
  const type = values.type
  const typeSelect = TYPE_SELECT[type]
  const hasParent = PARENT_TYPES[type].length > 0
  const parentRequired = type === 'fix'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="ticket-priority" className={SIDE_LABEL}>
          Prioridad
        </label>
        <Select
          id="ticket-priority"
          value={values.priority}
          options={toneOptions(TICKET_PRIORITY_OPTIONS)}
          disabled={submitting}
          onChange={(value) => onFieldChange('priority', value)}
        />
      </div>

      {/* The type's own dropdown, as a strip: a bug's severity, a fix's regression risk. */}
      {typeSelect && (
        <div>
          <p className={SIDE_LABEL}>
            {typeSelect.label}
            <RequiredMark />
          </p>
          <SegmentedField
            name={`ticket-${typeSelect.name}`}
            legend={typeSelect.label}
            options={typeSelect.options}
            value={values.typeFields[typeSelect.name]}
            disabled={submitting}
            onChange={(value) => onTypeFieldChange(typeSelect.name, value)}
          />
        </div>
      )}

      {HAS_POINTS[type] && (
        <div>
          <p className={SIDE_LABEL}>Puntos</p>
          <TicketPointsField
            id="ticket-points"
            value={values.points}
            disabled={submitting}
            onChange={(points) => onFieldChange('points', points)}
          />
        </div>
      )}

      <div className="hairline-t pt-4">
        <label htmlFor="ticket-epic" className={SIDE_LABEL}>
          Épica<RequiredMark />
        </label>
        <Select
          id="ticket-epic"
          value={values.epicId}
          options={epicPickerOptions(epicsForTicket(epics))}
          placeholder="Elegí una épica"
          searchable
          searchLabel="Buscar épica"
          noResults="Ninguna épica abierta coincide"
          disabled={submitting}
          error={errors.epicId}
          onChange={(value) => onFieldChange('epicId', value)}
        />
        {errors.epicId && (
          <p id="ticket-epic-error" className={FIELD_ERROR}>
            {errors.epicId}
          </p>
        )}
      </div>

      {hasParent && (
        <div>
          <label htmlFor="ticket-parent" className={SIDE_LABEL}>
            {type === 'fix' ? 'Bug que arregla' : 'Historia'}
            {parentRequired && <RequiredMark />}
          </label>
          <Select
            id="ticket-parent"
            value={values.parentId}
            options={parentPickerOptions(tickets, { type, epicId: values.epicId }, parentRequired ? undefined : 'Ninguna')}
            placeholder={values.epicId ? 'Elegí un ticket' : 'Primero elegí la épica'}
            searchable
            searchLabel="Buscar ticket"
            noResults={type === 'fix' ? 'No hay bugs en esta épica' : 'No hay historias en esta épica'}
            disabled={submitting || !values.epicId}
            error={errors.parentId}
            onChange={(value) => onFieldChange('parentId', value)}
          />
          {errors.parentId && (
            <p id="ticket-parent-error" className={FIELD_ERROR}>
              {errors.parentId}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="ticket-sprint" className={SIDE_LABEL}>
          Sprint
        </label>
        <Select
          id="ticket-sprint"
          value={values.sprintId}
          options={sprintPickerOptions(sprintsForTicket(sprints), 'Sin sprint (backlog)')}
          searchable
          searchLabel="Buscar sprint"
          noResults="Ningún sprint coincide"
          disabled={submitting}
          onChange={(value) => onFieldChange('sprintId', value)}
        />
      </div>

      <div>
        <label htmlFor="ticket-assignee" className={SIDE_LABEL}>
          Asignado a
        </label>
        <Select
          id="ticket-assignee"
          value={values.assigneeId}
          options={userPickerOptions(members, 'Sin asignar')}
          searchable
          searchLabel="Buscar persona"
          noResults="Nadie coincide"
          disabled={submitting}
          onChange={(value) => onFieldChange('assigneeId', value)}
        />
      </div>
    </div>
  )
}
