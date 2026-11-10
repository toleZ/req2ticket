import { Link } from 'react-router-dom'

import { AccentColorPicker } from '@/components/epics/AccentColorPicker/AccentColorPicker'
import { Button } from '@/components/ui/Button/Button'
import { DetailRow } from '@/components/ui/DetailRow/DetailRow'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { Select } from '@/components/ui/Select/Select'
import { toneOptions, userPickerOptions } from '@/components/ui/Select/Select.options'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS, findOption } from '@/lib/options'
import { SIDE_CAPTION } from './EpicDetailModal.styles'
import { openTicketsReason } from './EpicDetailModal.helpers'

/**
 * The side column of an epic's sheet: status, priority, owner, colour and the "Cerrar épica"
 * button. No state of its own: EpicDetailModal owns `values` and gets every change through
 * `onFieldChange(name, value)`; "Cerrar épica" calls `onSetStatus('closed')`.
 */
export function EpicSideFields({
  epic,
  values,
  members,
  canManage,
  submitting,
  isPlaceholderData,
  isClosed,
  openCount,
  openTicketsHref,
  onFieldChange,
  onSetStatus,
}) {
  const closeBlocked = openCount > 0

  return (
    <>
      {/* Two states, and each change has its own button ("Cerrar épica" below, "Reabrir" in the
          banner): the status reads as text. */}
      <DetailRow label="Estado" htmlFor={`epic-${epic.id}-status`}>
        <div className="w-full min-w-0">
          <ReadOnlyValue id={`epic-${epic.id}-status`}>
            {findOption(EPIC_STATUS_OPTIONS, epic.status)?.label}
          </ReadOnlyValue>
        </div>
      </DetailRow>

      <DetailRow label="Prioridad" htmlFor={`epic-${epic.id}-priority`}>
        <div className="w-full min-w-0">
          <Select
            id={`epic-${epic.id}-priority`}
            value={values.priority}
            options={toneOptions(EPIC_PRIORITY_OPTIONS)}
            readOnly={!canManage}
            disabled={submitting}
            onChange={(value) => onFieldChange('priority', value)}
          />
        </div>
      </DetailRow>

      <DetailRow label="Responsable" htmlFor={`epic-${epic.id}-owner`}>
        <div className="w-full min-w-0">
          <Select
            id={`epic-${epic.id}-owner`}
            value={values.ownerId}
            options={userPickerOptions(members, 'Sin asignar')}
            searchable
            searchLabel="Buscar persona"
            noResults="Nadie coincide"
            readOnly={!canManage}
            disabled={submitting}
            onChange={(value) => onFieldChange('ownerId', value)}
          />
        </div>
      </DetailRow>

      {/* Stacked and not in a detail row: ten swatches do not fit beside the label. */}
      {canManage && (
        <div className="py-1">
          <p className={SIDE_CAPTION}>Color</p>
          <AccentColorPicker
            value={values.accentColor}
            disabled={submitting}
            size="sm"
            onChange={(accentColor) => onFieldChange('accentColor', accentColor)}
          />
        </div>
      )}

      {/* Closing has its own button: it is a decision, not one more field to edit. */}
      {canManage && !isClosed && (
        <div className="hairline-t mt-2 flex flex-col items-start gap-1.5 pt-3">
          {closeBlocked ? (
            <Tooltip label={openTicketsReason(openCount)} wrapsDisabled>
              <Button variant="neutral" size="sm" disabled>
                Cerrar épica
              </Button>
            </Tooltip>
          ) : (
            <Button
              variant="neutral"
              size="sm"
              disabled={submitting || isPlaceholderData}
              onClick={() => onSetStatus('closed')}
            >
              Cerrar épica
            </Button>
          )}
          {closeBlocked && (
            <Link to={openTicketsHref} className="text-footnote text-blue-text hover:underline">
              Ver tickets abiertos
            </Link>
          )}
        </div>
      )}
    </>
  )
}
