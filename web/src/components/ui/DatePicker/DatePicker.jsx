/* No hace falta leer esto para usar DatePicker: it takes `value` and `onChange` with dates as
   'YYYY-MM-DD' strings, the same as a native <input type="date">, which is what it replaces.

   The browser's own calendar could not be styled, spoke the browser's language (English month
   names in a Spanish app) and looked different in every browser. This one is drawn by the app.

   Inside it works like SearchSelect: a button opens a panel that floats over what is below,
   opens upwards when there is more room above, and closes on Escape (without closing the modal
   around it), on Tab out of it, or on a click elsewhere.

   The keyboard follows the usual date grid: arrows move a day or a week, Home and End go to the
   start or end of the week, PageUp and PageDown change month, Enter picks.

   `range` is optional: `{ start, end }`. The sprint sheets pass both dates to both fields, so
   the calendar shades the days between them and the footer says how long the sprint lasts. */
import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'
import { parseDateOnly } from '@/lib/dates'
import { springSnappy } from '@/lib/motion'
import { GUTTER, PANEL_HEIGHT, PANEL_WIDTH, WEEKDAYS } from './DatePicker.data'
import {
  addDays,
  addMonths,
  daysBetween,
  fixedOrigin,
  formatSpoken,
  formatTrigger,
  monthDays,
  monthTitle,
  todayIso,
} from './DatePicker.helpers'
import {
  BAND,
  CELL,
  DAY,
  DAY_DEFAULT,
  DAY_DISABLED,
  DAY_OTHER_END,
  DAY_OUTSIDE,
  DAY_SELECTED,
  DURATION,
  FOOTER,
  HEADER,
  NAV_BUTTON,
  PANEL,
  TITLE,
  TODAY_BUTTON,
  TODAY_DOT,
  TRIGGER,
  WEEKDAY,
} from './DatePicker.styles'

export function DatePicker({
  id,
  value,
  min,
  range,
  placeholder = 'Elegir fecha',
  disabled = false,
  error,
  onChange,
}) {
  const [open, setOpen] = useState(false)
  // Where the panel goes, in viewport pixels (see openPanel).
  const [position, setPosition] = useState({})
  // The day the keyboard is on. The month on screen is always the one this day is in, except
  // after the chevrons move the view away from it (see `view`).
  const [focused, setFocused] = useState(value || todayIso())
  const [view, setView] = useState(() => monthOf(value || todayIso()))
  // 1 when the month shown moves forward, -1 back: the grid slides in from that side.
  const [direction, setDirection] = useState(0)
  const triggerRef = useRef(null)
  const baseId = useId()

  const today = todayIso()
  const days = monthDays(view.year, view.month)
  const weeks = [0, 1, 2, 3, 4, 5].map((week) => days.slice(week * 7, week * 7 + 7))
  const titleId = `${baseId}-title`
  const valueId = `${baseId}-value`

  const rangeStart = range?.start
  const rangeEnd = range?.end
  const hasRange = Boolean(rangeStart && rangeEnd && rangeEnd >= rangeStart)
  const duration = hasRange ? daysBetween(rangeStart, rangeEnd) : 0

  // Only one day in the grid is reachable with Tab: the focused one if it is on screen,
  // otherwise the first day of the month that can be picked.
  const tabStop = days.some((day) => day.iso === focused && day.inMonth)
    ? focused
    : days.find((day) => day.inMonth && !isDisabled(day.iso))?.iso

  /* The panel is fixed to the viewport, so it would stay put while the column under it
     scrolled away. Any scroll closes it instead, the way a native picker does. */
  useEffect(() => {
    if (!open) return

    function close() {
      setOpen(false)
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  /* The focus follows `focused` while the panel is open. It only changes on purpose (opening
     the panel, an arrow key), so the chevrons can change month without stealing the focus. */
  useEffect(() => {
    if (open) document.getElementById(`${baseId}-${focused}`)?.focus({ preventScroll: true })
  }, [open, focused, baseId])

  function isDisabled(iso) {
    return Boolean(min && iso < min)
  }

  /* Unlike SearchSelect's list, the calendar is taller than a sheet's side column, whose
     overflow would cut it off. So it is `fixed` and placed from the trigger's box: lined up
     with its right edge, below it or, when there is more room, above it. `fixed` escapes the
     column's overflow; fixedOrigin covers the moment the modal is still animating in. */
  function openPanel() {
    const trigger = triggerRef.current.getBoundingClientRect()
    const below = window.innerHeight - trigger.bottom
    const openUp = below < PANEL_HEIGHT && trigger.top > below
    const left = Math.max(GUTTER, Math.min(trigger.right - PANEL_WIDTH, window.innerWidth - PANEL_WIDTH - GUTTER))
    const origin = fixedOrigin(triggerRef.current)
    setPosition(
      openUp
        ? { left: left - origin.x, bottom: origin.y + origin.height - trigger.top + 4, transformOrigin: 'bottom right' }
        : { left: left - origin.x, top: trigger.bottom + 4 - origin.y, transformOrigin: 'top right' },
    )

    let start = value || today
    if (min && start < min) start = min
    setFocused(start)
    setView(monthOf(start))
    setDirection(0)
    setOpen(true)
  }

  function closePanel() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function pick(iso) {
    if (isDisabled(iso)) return
    onChange(iso)
    closePanel()
  }

  function moveFocus(target) {
    const next = isDisabled(target) ? min : target
    const nextMonth = monthOf(next)
    if (nextMonth.year !== view.year || nextMonth.month !== view.month) {
      setDirection(next > focused ? 1 : -1)
      setView(nextMonth)
    }
    setFocused(next)
  }

  function showMonth(amount) {
    const first = new Date(view.year, view.month + amount, 1)
    setDirection(amount)
    setView({ year: first.getFullYear(), month: first.getMonth() })
  }

  function handleGridKeyDown(e) {
    const weekday = (parseDateOnly(focused).getDay() + 6) % 7
    const moves = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekday),
      End: () => addDays(focused, 6 - weekday),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    }
    if (!moves[e.key]) return
    e.preventDefault()
    moveFocus(moves[e.key]())
  }

  function handlePanelKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      closePanel()
    }
  }

  function handleTriggerKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openPanel()
    }
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  function dayClass(day) {
    if (day.iso === value) return DAY_SELECTED
    if (isDisabled(day.iso)) return DAY_DISABLED
    if (day.iso === rangeStart || day.iso === rangeEnd) return DAY_OTHER_END
    if (!day.inMonth) return DAY_OUTSIDE
    return cn(DAY_DEFAULT, day.iso === today && 'font-semibold text-blue-text')
  }

  /* The band runs behind the days between the two ends. The ends get half of it (the half
     that faces the other end), and it rounds off at the edges of each week. */
  function bandClass(day) {
    if (!hasRange || rangeStart === rangeEnd) return null
    if (day.iso < rangeStart || day.iso > rangeEnd) return null

    let sides = 'inset-x-0'
    if (day.iso === rangeStart) sides = 'left-1/2 right-0'
    if (day.iso === rangeEnd) sides = 'left-0 right-1/2'

    return cn(
      BAND,
      sides,
      day.column === 0 && day.iso !== rangeStart && 'left-0.5 rounded-l-full',
      day.column === 6 && day.iso !== rangeEnd && 'right-0.5 rounded-r-full',
    )
  }

  return (
    <div className="relative" onBlur={handleBlur}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${valueId} ${id}-error` : valueId}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        className={TRIGGER}
      >
        {/* A <label> names this button, and a name replaces the button's own text: without
            this description a screen reader would say "Inicio" and never the date. */}
        <span id={valueId} className={cn('min-w-0 flex-1 truncate', !value && 'text-label-tertiary')}>
          {value ? formatTrigger(value) : placeholder}
        </span>
        <CalendarDays className="size-3.5 shrink-0 text-label-secondary" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-labelledby={titleId}
          onKeyDown={handlePanelKeyDown}
          // A click on the panel's padding must not take the focus off it: that would count
          // as leaving the panel and close it.
          onMouseDown={(e) => e.preventDefault()}
          style={position}
          className={PANEL}
        >
          <div className={HEADER}>
            <h3 id={titleId} aria-live="polite" className={TITLE}>
              {monthTitle(view.year, view.month)}
            </h3>
            <button type="button" aria-label="Mes anterior" onClick={() => showMonth(-1)} className={NAV_BUTTON}>
              <ChevronLeft className="size-4.5" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Mes siguiente" onClick={() => showMonth(1)} className={NAV_BUTTON}>
              <ChevronRight className="size-4.5" aria-hidden="true" />
            </button>
          </div>

          <div role="grid" aria-labelledby={titleId} onKeyDown={handleGridKeyDown}>
            <div role="row" className="grid grid-cols-7">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday.name} role="columnheader" aria-label={weekday.name} className={WEEKDAY}>
                  {weekday.letter}
                </span>
              ))}
            </div>

            {/* Keyed by month, so a new month is a new block that slides in from the side the
                user is heading to. No exit: the old month is simply replaced, the panel keeps
                its height (always six weeks) and nothing jumps. */}
            <motion.div
              key={`${view.year}-${view.month}`}
              initial={{ opacity: 0, x: direction * 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={springSnappy}
              role="rowgroup"
            >
              {weeks.map((week) => (
                <div key={week[0].iso} role="row" className="grid grid-cols-7">
                  {week.map((day) => (
                    <div key={day.iso} role="gridcell" aria-selected={day.iso === value} className={CELL}>
                      {bandClass(day) && <span className={bandClass(day)} aria-hidden="true" />}
                      <button
                        id={`${baseId}-${day.iso}`}
                        type="button"
                        tabIndex={day.iso === tabStop ? 0 : -1}
                        aria-label={formatSpoken(day.iso)}
                        aria-current={day.iso === today ? 'date' : undefined}
                        aria-disabled={isDisabled(day.iso) ? true : undefined}
                        onClick={() => pick(day.iso)}
                        className={cn(DAY, dayClass(day))}
                      >
                        {day.day}
                        {day.iso === today && <span className={TODAY_DOT} aria-hidden="true" />}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          <div className={FOOTER}>
            <button type="button" disabled={isDisabled(today)} onClick={() => pick(today)} className={TODAY_BUTTON}>
              Hoy
            </button>
            {duration > 0 && (
              <span className={DURATION}>
                {duration === 1 ? '1 día' : `${duration} días`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function monthOf(iso) {
  const date = parseDateOnly(iso)
  return { year: date.getFullYear(), month: date.getMonth() }
}
