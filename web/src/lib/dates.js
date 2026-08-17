const SHORT_MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Evita el desfasaje de un día que da `new Date('2026-08-05')`: ese constructor interpreta
// la fecha en UTC, y acá siempre queremos la fecha tal cual la manda el backend.
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

// Redondea hacia arriba para que "faltan 8 días" siga contando el día de hoy como uno
// pendiente, no como medio día ya transcurrido.
export function daysRemaining(endDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = parseDateOnly(endDate)
  return Math.ceil((end - today) / MS_PER_DAY)
}
