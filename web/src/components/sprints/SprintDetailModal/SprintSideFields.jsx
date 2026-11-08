import { DatePicker } from '@/components/ui/DatePicker/DatePicker'
import { DetailRow } from '@/components/ui/DetailRow/DetailRow'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { SHEET_INPUT } from '@/components/ui/SheetField/SheetField.styles'
import { SIDE_ERROR, SIDE_NOTE } from './SprintDetailModal.styles'

/**
 * The side column of a sprint's sheet: start, end and capacity. No state of its own:
 * SprintDetailModal owns `values`; the dates come back through `onFieldChange(name, value)` and
 * the capacity input through `onChange` (a plain input handler, it reads `e.target.name`).
 */
export function SprintSideFields({
  sprint,
  ids,
  values,
  errors,
  canManage,
  canDelete,
  isEditable,
  submitting,
  onFieldChange,
  onChange,
}) {
  return (
    <>
      {/* The status is the header's badge; here only why it cannot be deleted. */}
      {canManage && !canDelete && <p className={SIDE_NOTE}>Los sprints iniciados quedan como historia.</p>}

      <DetailRow label="Inicio" htmlFor={ids.startDate}>
        <DatePicker
          id={ids.startDate}
          value={values.startDate}
          range={{ start: values.startDate, end: values.endDate }}
          readOnly={!isEditable}
          disabled={submitting}
          error={errors.startDate}
          onChange={(value) => onFieldChange('startDate', value)}
        />
      </DetailRow>
      {errors.startDate && (
        <p id={`${ids.startDate}-error`} className={SIDE_ERROR}>
          {errors.startDate}
        </p>
      )}

      <DetailRow label="Fin" htmlFor={ids.endDate}>
        <DatePicker
          id={ids.endDate}
          value={values.endDate}
          min={values.startDate || undefined}
          range={{ start: values.startDate, end: values.endDate }}
          readOnly={!isEditable}
          disabled={submitting}
          error={errors.endDate}
          onChange={(value) => onFieldChange('endDate', value)}
        />
      </DetailRow>
      {errors.endDate && (
        <p id={`${ids.endDate}-error`} className={SIDE_ERROR}>
          {errors.endDate}
        </p>
      )}

      <DetailRow label="Capacidad" htmlFor={isEditable ? ids.capacity : undefined}>
        {isEditable ? (
          <>
            <input
              id={ids.capacity}
              type="number"
              name="capacity"
              min="0"
              max="999"
              inputMode="numeric"
              value={values.capacity}
              disabled={submitting}
              aria-invalid={errors.capacity ? true : undefined}
              aria-describedby={errors.capacity ? `${ids.capacity}-error` : undefined}
              onChange={onChange}
              className={`${SHEET_INPUT} max-w-20 tabular-nums`}
            />
            <span className="text-footnote text-label-secondary">pts</span>
          </>
        ) : (
          <ReadOnlyValue>{sprint.capacity} pts</ReadOnlyValue>
        )}
      </DetailRow>
      {errors.capacity && (
        <p id={`${ids.capacity}-error`} className={SIDE_ERROR}>
          {errors.capacity}
        </p>
      )}
    </>
  )
}
