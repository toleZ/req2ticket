import { Lock } from 'lucide-react'

import { Banner } from '@/components/ui/Banner/Banner'
import { Button } from '@/components/ui/Button/Button'
import { InlineTitleField } from '@/components/ui/InlineTitleField/InlineTitleField'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { SHEET_TEXTAREA } from '@/components/ui/SheetField/SheetField.styles'
import { cancelledNote } from '@/lib/ticketStats'
import { FIELD_LABEL, PROGRESS_META, SECTION_LABEL } from './EpicDetailModal.styles'

/**
 * The main column of an epic's sheet: the "closed" banner, the name, the description and the
 * progress of its tickets. No state of its own: `onChange` is a plain input handler (it reads
 * `e.target.name`), and "Reabrir" calls `onSetStatus('open')`.
 */
export function EpicMainFields({
  epic,
  values,
  errors,
  stats,
  canManage,
  submitting,
  isPlaceholderData,
  isClosed,
  onChange,
  onSetStatus,
}) {
  return (
    <>
      {isClosed && (
        <Banner
          tone="warning"
          icon={Lock}
          title="Épica cerrada: reabrila para hacer cambios"
          action={
            canManage && (
              <Button
                size="sm"
                variant="neutral"
                disabled={submitting || isPlaceholderData}
                onClick={() => onSetStatus('open')}
              >
                Reabrir
              </Button>
            )
          }
        >
          Sus tickets se ven en solo lectura y no se le pueden agregar nuevos.
        </Banner>
      )}

      {canManage ? (
        <InlineTitleField
          name="name"
          ariaLabel="Nombre"
          value={values.name}
          disabled={submitting}
          error={errors.name}
          onChange={onChange}
        />
      ) : (
        <p className="text-title2 text-label">{epic.name}</p>
      )}

      <div>
        <label htmlFor={`epic-${epic.id}-description`} className={FIELD_LABEL}>
          Descripción
        </label>
        {isPlaceholderData ? (
          <p className="animate-fade-in-late text-footnote text-label-secondary">Cargando…</p>
        ) : canManage ? (
          <>
            <textarea
              id={`epic-${epic.id}-description`}
              name="description"
              rows={4}
              maxLength={2000}
              value={values.description}
              disabled={submitting}
              onChange={onChange}
              className={SHEET_TEXTAREA}
            />
            {errors.description && <p className="mt-1 text-footnote text-red-text">{errors.description}</p>}
          </>
        ) : (
          <ReadOnlyValue id={`epic-${epic.id}-description`} variant="field" empty="Sin descripción">
            {epic.description}
          </ReadOnlyValue>
        )}
      </div>

      <EpicProgress stats={stats} />
    </>
  )
}

/* "3 de 5 tickets completados · 8/13 pts" and its bar. `stats` comes from summarizeTickets. */
function EpicProgress({ stats }) {
  return (
    <div>
      <p className={SECTION_LABEL}>Avance</p>
      {stats.all === 0 ? (
        <p className="text-footnote text-label-secondary">
          Esta épica todavía no tiene tickets.
        </p>
      ) : (
        <>
          <div className={PROGRESS_META}>
            <span>
              {stats.completed} de {stats.total} tickets completados
              {cancelledNote(stats)}
            </span>
            <span>
              {stats.pointsCompleted}/{stats.points} pts
            </span>
          </div>
          <ProgressBar
            value={stats.completed}
            max={stats.total}
            label={`Tickets completados: ${stats.completed} de ${stats.total}`}
            className="mt-1.5"
          />
        </>
      )}
    </div>
  )
}
