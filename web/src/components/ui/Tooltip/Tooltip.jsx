import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/cn'
import { ALIGN_CLASSES, BUBBLE, SIDE_CLASSES, WRAP, WRAP_DISABLED } from './Tooltip.styles'

const HOVER_DELAY = 300

/**
 * A short text that appears over a control on hover, on keyboard focus and on tap. Its main
 * job here is AUTH-1's rule: a control blocked by a business rule stays visible, disabled, and
 * says why.
 *
 *     <Tooltip label="Ya hay un sprint activo: Sprint 4" wrapsDisabled>
 *       <Button disabled>Iniciar</Button>
 *     </Tooltip>
 *
 * `wrapsDisabled`: pass it when the child is disabled. The wrapper then takes the focus and the
 * pointer in its place, so the reason is reachable with Tab and with a finger too.
 *
 * Around an enabled control, give the tooltip an `id` and point the control's
 * `aria-describedby` at it, so a screen reader reads the text with the control.
 */
export function Tooltip({ label, id, side = 'top', align = 'center', wrapsDisabled = false, children }) {
  const autoId = useId()
  const tooltipId = id ?? autoId
  const [open, setOpen] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function show(delay) {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(true), delay)
  }

  function hide() {
    clearTimeout(timer.current)
    setOpen(false)
  }

  return (
    <span
      className={cn(WRAP, wrapsDisabled && WRAP_DISABLED)}
      tabIndex={wrapsDisabled ? 0 : undefined}
      aria-describedby={wrapsDisabled ? tooltipId : undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && show(HOVER_DELAY)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
      onPointerDown={(e) => e.pointerType !== 'mouse' && (open ? hide() : show(0))}
      onFocus={() => show(0)}
      onBlur={hide}
      onKeyDown={(e) => e.key === 'Escape' && hide()}
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          BUBBLE,
          SIDE_CLASSES[side],
          ALIGN_CLASSES[align],
          /* `hidden` while closed, not just invisible: an invisible bubble still takes room, and
             inside a scrollable column (a sheet's side panel) it made the column scroll
             sideways — enough to move a button out from under the pointer mid-click. */
          open ? 'animate-fade-in' : 'hidden',
        )}
      >
        {label}
      </span>
    </span>
  )
}
