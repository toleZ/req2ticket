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
