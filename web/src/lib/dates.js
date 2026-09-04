const SHORT_MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Avoids the off-by-one day that `new Date('2026-08-05')` produces: that constructor
// reads the date as UTC, and here we always want the date exactly as the backend sent it.
function parseDateOnly(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatShort(date) {
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`
}

export function formatDateRange(startDate, endDate) {
  return `${formatShort(parseDateOnly(startDate))} — ${formatShort(parseDateOnly(endDate))}`
}

// Rounds up so that "8 days left" still counts today as a pending day rather than as
// half a day already gone.
export function daysRemaining(endDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = parseDateOnly(endDate)
  return Math.ceil((end - today) / MS_PER_DAY)
}

/* "hace 5 horas", "hace 40 días". It only looks backwards: `createdAt` and `updatedAt` are
   always in the past, so there is no "in 3 days" case to solve.

   Hand-written rather than Intl.RelativeTimeFormat because that one formats in the browser's
   language, and the rest of this file already writes the months in Spanish (see SHORT_MONTHS).
   Mixing the two sources would give "hace 5 hours" in an English browser.

   Months are 30 days and years 365. It is not exact and does not need to be: this says how
   long ago something happened, not on what date — the full date in the title is for that. */
export function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)

  // Below this threshold any number reads oddly ("hace 0 minutos").
  if (seconds < 45) return 'hace un momento'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return minutes === 1 ? 'hace un minuto' : `hace ${minutes} minutos`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? 'hace una hora' : `hace ${hours} horas`

  const days = Math.floor(hours / 24)
  if (days < 30) return days === 1 ? 'hace un día' : `hace ${days} días`

  const months = Math.floor(days / 30)
  if (months < 12) return months === 1 ? 'hace un mes' : `hace ${months} meses`

  const years = Math.floor(days / 365)
  return years === 1 ? 'hace un año' : `hace ${years} años`
}

/* The full date, for the `title` of whatever shows a timeAgo. "28 ago 2026, 14:05". */
export function formatDateTime(value) {
  const date = new Date(value)
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

  return `${formatShort(date)} ${date.getFullYear()}, ${time}`
}
