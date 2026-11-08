import { completedSummary } from '@/components/sprints/SprintRow/SprintRow.helpers'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { SHEET_TEXTAREA } from '@/components/ui/SheetField/SheetField.styles'
import { cancelledNote } from '@/lib/ticketStats'
import { FIELD_LABEL, OVER_CAPACITY, PROGRESS_META, SECTION_LABEL } from './SprintDetailModal.styles'

/**
 * The main column of a sprint's sheet: the name, the goal and the progress (or, once completed,
 * the result). No state of its own: `onChange` is a plain input handler (it reads
 * `e.target.name`).
 */
export function SprintMainFields({ sprint, ids, values, errors, stats, isEditable, isCompleted, submitting, onChange }) {
  return (
    <>
      {isEditable ? (
        <InlineTitleField
          id={ids.name}
          name="name"
          ariaLabel="Nombre"
          value={values.name}
          disabled={submitting}
          error={errors.name}
          onChange={onChange}
        />
      ) : (
        <p className="text-title2 text-label">{sprint.name}</p>
      )}

      <div>
        <label htmlFor={ids.goal} className={FIELD_LABEL}>
          Meta
        </label>
        {isEditable ? (
          <>
            <textarea
              id={ids.goal}
              name="goal"
              rows={4}
              maxLength={500}
              value={values.goal}
              disabled={submitting}
              onChange={onChange}
              placeholder="Qué queremos haber terminado cuando cierre"
              className={SHEET_TEXTAREA}
            />
            {errors.goal && <p className="mt-1 text-footnote text-red-text">{errors.goal}</p>}
          </>
        ) : (
          <ReadOnlyValue id={ids.goal} variant="field" empty="Sin meta">
            {sprint.goal}
          </ReadOnlyValue>
        )}
      </div>

      <SprintProgress sprint={sprint} values={values} stats={stats} isCompleted={isCompleted} />
    </>
  )
}

/* "Avance" while the sprint runs (tickets, points, bar and the over-capacity warning);
   "Resultado" once it is completed. `stats` comes from summarizeTickets. */
function SprintProgress({ sprint, values, stats, isCompleted }) {
  const capacity = Number(values.capacity)
  const overCapacity = values.capacity === '' ? 0 : sprint.committedPoints - capacity

  return (
    <div>
      <p className={SECTION_LABEL}>{isCompleted ? 'Resultado' : 'Avance'}</p>
      {stats.all === 0 ? (
        <p className="text-footnote text-label-secondary">
          Todavía no hay tickets asignados a este sprint.
        </p>
      ) : isCompleted ? (
        <p className="text-footnote text-label-secondary">
          {completedSummary(stats)} · {stats.pointsCompleted} pts entregados
        </p>
      ) : (
        <>
          <div className={PROGRESS_META}>
            <span>
              {stats.completed} de {stats.total} tickets completados
              {cancelledNote(stats)}
            </span>
            <span className="tabular-nums">
              {stats.pointsCompleted}/{stats.points} pts
            </span>
          </div>
          <ProgressBar
            value={stats.completed}
            max={stats.total}
            label={`Tickets completados: ${stats.completed} de ${stats.total}`}
            className="mt-1.5"
          />
          {/* Recomputed from the field, so it answers while the capacity is being typed. */}
          {overCapacity > 0 && (
            <p className={OVER_CAPACITY}>
              {sprint.committedPoints} / {capacity} pts: {overCapacity} más de lo que entra.
            </p>
          )}
        </>
      )}
    </div>
  )
}
