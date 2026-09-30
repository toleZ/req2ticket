import { useId } from 'react'

import { SelectionPill } from '@/components/ui/SelectionPill/SelectionPill'
import { cn } from '@/lib/cn'
import { POINTS_SCALE } from './TicketPointsField.data'
import { handlePointsKeyDown } from './TicketPointsField.helpers'
import { CHIP, GROUP, PILL } from './TicketPointsField.styles'

/**
 * A ticket's points, as the design's segmented strip.
 *
 * `value` and `onChange` work with strings, just like an <input>: the conversion to a number
 * happens once, in lib/api/tickets.js, so this control behaves like any other field of the
 * form containing it.
 */
export function TicketPointsField({ id, value, disabled, onChange }) {
  const current = Number(value)
  const pillId = useId()

  /* Points is a free integer in the API: nothing stops a 4 or a 21 loaded from somewhere else.
     If the current value is not on the scale it is appended instead of lost — a strip that
     cannot show what the ticket holds today would mean opening the modal and saving without
     touching anything silently changed its points. */
  const scale = POINTS_SCALE.includes(current) ? POINTS_SCALE : [...POINTS_SCALE, current]

  return (
    <div
      id={id}
      className={GROUP}
      role="radiogroup"
      aria-label="Puntos"
      onKeyDown={(e) => handlePointsKeyDown(e, scale, current, onChange)}
    >
      {scale.map((point) => (
        <button
          key={point}
          type="button"
          role="radio"
          aria-checked={current === point}
          tabIndex={current === point ? 0 : -1}
          data-point={point}
          aria-label={point === 0 ? 'Sin estimar' : `${point} puntos`}
          disabled={disabled}
          onClick={() => onChange(String(point))}
          className={cn(CHIP, current === point && 'text-label')}
        >
          {current === point && <SelectionPill layoutId={pillId} className={PILL} />}
          {/* The 0 is drawn as a dash: "0 puntos" and "sin estimar" mean the same thing here,
              and the dash says it without making you read a number that means nothing. */}
          <span className="relative">{point === 0 ? '–' : point}</span>
        </button>
      ))}
    </div>
  )
}
