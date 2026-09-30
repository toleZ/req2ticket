import { parseDateOnly } from '@/lib/dates'
import { MONTHS, SHORT_MONTHS, WEEKDAYS } from './DatePicker.data'

/* Every date in here travels as 'YYYY-MM-DD', the same string the API and a native date input
   use. Two of them compare correctly with < and >, so no Date is needed to check a range. */
export function toIso(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function todayIso() {
  return toIso(new Date())
}

export function addDays(iso, amount) {
  const date = parseDateOnly(iso)
  date.setDate(date.getDate() + amount)
  return toIso(date)
}

/* Same day in the month `amount` months away. The 31st of March plus one month would be the
   1st of May in plain Date arithmetic; this keeps it on the 30th of April instead. */
export function addMonths(iso, amount) {
  const date = parseDateOnly(iso)
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(date.getDate(), lastDay))
  return toIso(target)
}

/* The six weeks shown for a month, Monday first: always 42 days, so the panel keeps the same
   height whichever month it shows. */
export function monthDays(year, month) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const days = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - offset + i)
    days.push({
      iso: toIso(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      column: i % 7,
    })
  }
  return days
}

export function monthTitle(year, month) {
  return `${MONTHS[month][0].toUpperCase()}${MONTHS[month].slice(1)} ${year}`
}

// "2 abr 2026": the trigger always shows the year, a date field is no place to guess it.
export function formatTrigger(iso) {
  const date = parseDateOnly(iso)
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// "jueves 2 de abril de 2026", for each day's aria-label.
export function formatSpoken(iso) {
  const date = parseDateOnly(iso)
  const weekday = WEEKDAYS[(date.getDay() + 6) % 7].name
  return `${weekday} ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`
}

// Both ends counted: a sprint from the 2nd to the 15th lasts 14 days.
export function daysBetween(startIso, endIso) {
  const ms = parseDateOnly(endIso) - parseDateOnly(startIso)
  return Math.round(ms / (24 * 60 * 60 * 1000)) + 1
}

/* The box a `position: fixed` panel is really placed against. Normally that is the viewport,
   but an ancestor with a transform (the modal while its opening animation runs) takes its
   place, and then `top` and `left` count from that ancestor's corner instead. */
export function fixedOrigin(element) {
  let parent = element.parentElement
  while (parent) {
    const style = getComputedStyle(parent)
    const containsFixed =
      style.transform !== 'none' ||
      style.filter !== 'none' ||
      style.backdropFilter !== 'none' ||
      style.perspective !== 'none' ||
      style.willChange.includes('transform')
    if (containsFixed) {
      const box = parent.getBoundingClientRect()
      return { x: box.left, y: box.top, height: box.height }
    }
    parent = parent.parentElement
  }
  return { x: 0, y: 0, height: window.innerHeight }
}
