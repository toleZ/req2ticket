import { cn } from '@/lib/cn'

/* Same height, padding and corners as Select's, DatePicker's and the fields' boxes, so the
   form keeps its rhythm and nothing floats loose. No fill and a dashed hairline instead: an
   input has a fill and a solid edge, a disabled control is dimmed, and this is neither — the
   dashed outline is the usual "you can see this, not change it". The value keeps full contrast. */
const BOX = 'flex min-h-11 min-w-0 items-center gap-2 rounded-control border border-dashed border-separator bg-transparent text-label'
const SHEET = `${BOX} px-2 py-1 text-footnote lg:min-h-8 lg:py-0.5`
const FIELD = `${BOX} px-3 py-2 text-body lg:min-h-0`

/**
 * A value shown as text on a soft background where somebody else would see a control.
 * AUTH-1's rule: a field you may not edit is never a disabled input.
 *
 * You rarely use it directly: Select, DatePicker and the fields take `readOnly` and draw this
 * themselves. Reach for it only for a value no control covers.
 *
 *     <ReadOnlyValue>{formatDate(sprint.startDate)}</ReadOnlyValue>
 */
export function ReadOnlyValue({ id, variant = 'sheet', empty = 'Sin definir', className, children }) {
  const isEmpty = children === null || children === undefined || children === ''

  return (
    <p id={id} className={cn(variant === 'field' ? FIELD : SHEET, className)}>
      {isEmpty ? <span className="text-label-tertiary">{empty}</span> : children}
    </p>
  )
}
