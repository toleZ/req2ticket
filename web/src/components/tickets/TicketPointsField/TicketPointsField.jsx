import { cn } from '@/lib/cn'

/* The design's scale, with 0 up front. The 0 is not an odd case to be tolerated: the create
   modal sends `Number(points) || 0`, so every ticket created without an estimate arrives at
   zero. It has to be a selectable value, not something the control cannot draw. */
const POINTS_SCALE = [0, 1, 2, 3, 5, 8, 13]

const GROUP = 'flex flex-wrap gap-1 rounded-control bg-fill-tertiary p-1'

const CHIP = `min-w-7 rounded-control px-1.5 py-0.5 text-caption font-medium text-label-secondary
  transition-colors duration-fast ease-out-quad hover:text-label disabled:opacity-50`

/* The chosen one climbs a surface instead of turning blue. It is the same device the rest of
   the app uses to say "this is active" without spending the accent, which here is already
   taken by the priority and the status. */
const CHIP_ON = 'bg-elevated text-label shadow-hairline'

/**
 * A ticket's points, as the design's segmented strip.
 *
 * `value` and `onChange` work with strings, just like an <input>: the conversion to a number
 * happens once, in lib/api/tickets.js, so this control behaves like any other field of the
 * form containing it.
 */
export function TicketPointsField({ id, value, disabled, onChange }) {
  const current = Number(value)

  /* Points is a free integer in the API: nothing stops a 4 or a 21 loaded from somewhere else.
     If the current value is not on the scale it is appended instead of lost — a strip that
     cannot show what the ticket holds today would mean opening the modal and saving without
     touching anything silently changed its points. */
  const scale = POINTS_SCALE.includes(current) ? POINTS_SCALE : [...POINTS_SCALE, current]

  return (
    <div id={id} className={GROUP} role="radiogroup" aria-label="Puntos">
      {scale.map((point) => (
        <button
          key={point}
          type="button"
          role="radio"
          aria-checked={current === point}
          aria-label={point === 0 ? 'Sin estimar' : `${point} puntos`}
          disabled={disabled}
          onClick={() => onChange(String(point))}
          className={cn(CHIP, current === point && CHIP_ON)}
        >
          {/* The 0 is drawn as a dash: "0 puntos" and "sin estimar" mean the same thing here,
              and the dash says it without making you read a number that means nothing. */}
          {point === 0 ? '–' : point}
        </button>
      ))}
    </div>
  )
}
