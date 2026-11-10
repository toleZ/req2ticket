import { TicketPointsField } from '@/components/tickets/TicketPointsField/TicketPointsField'
import {
  epicName,
  epicsForTicket,
  parentOf,
  parentPickerOptions,
  sprintName,
  sprintsForTicket,
} from '@/components/tickets/TicketPickers/TicketPickers'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { SegmentedField } from '@/components/ui/SegmentedField/SegmentedField'
import { Select } from '@/components/ui/Select/Select'
import { epicPickerOptions, sprintPickerOptions, toneOptions, userPickerOptions } from '@/components/ui/Select/Select.options'
import { RequiredMark } from '@/components/ui/SheetField/SheetField'
import { FIELD_ERROR, SIDE_LABEL, SIDE_NOTE } from '@/components/ui/SheetField/SheetField.styles'
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
  const parent = hasParent ? parentOf(tickets, values.parentId) : null
  const taskOfStory = type === 'task' && parent !== null

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
          {taskOfStory && <p className={SIDE_NOTE}>No suman al sprint: la historia ya los cubre.</p>}
        </div>
      )}

      {/* The parent first: it decides the epic (always) and the sprint (for a task). */}
      {hasParent && (
        <div className="hairline-t pt-4">
          <label htmlFor="ticket-parent" className={SIDE_LABEL}>
            {type === 'fix' ? 'Bug que arregla' : 'Historia'}
            {parentRequired && <RequiredMark />}
          </label>
          <Select
            id="ticket-parent"
            value={values.parentId}
            options={parentPickerOptions(tickets, { type }, parentRequired ? undefined : 'Ninguna')}
            placeholder="Elegí un ticket"
            searchable
            searchLabel="Buscar ticket"
            noResults={type === 'fix' ? 'No hay bugs abiertos' : 'No hay historias abiertas'}
            disabled={submitting}
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

      <div className={hasParent ? undefined : 'hairline-t pt-4'}>
        <label htmlFor="ticket-epic" className={SIDE_LABEL}>
          Épica
        </label>
        {parent ? (
          <ReadOnlyValue id="ticket-epic">
            {epicName(epics, parent.epicId)} · de {parent.code}
          </ReadOnlyValue>
        ) : (
          <Select
            id="ticket-epic"
            value={values.epicId}
            options={epicPickerOptions(epicsForTicket(epics), 'Sin épica')}
            searchable
            searchLabel="Buscar épica"
            noResults="Ninguna épica abierta coincide"
            disabled={submitting}
            onChange={(value) => onFieldChange('epicId', value)}
          />
        )}
      </div>

      <div>
        <label htmlFor="ticket-sprint" className={SIDE_LABEL}>
          Sprint
        </label>
        {taskOfStory ? (
          <ReadOnlyValue id="ticket-sprint">
            {sprintName(sprints, parent.sprintId)} · sigue a {parent.code}
          </ReadOnlyValue>
        ) : (
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
        )}
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
