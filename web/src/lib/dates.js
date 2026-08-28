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

/* "hace 5 horas", "hace 40 días". Solo mira hacia atrás: `createdAt` y `updatedAt` siempre
   están en el pasado, así que no hay un caso "en 3 días" que resolver.

   Escrita a mano y no con Intl.RelativeTimeFormat porque esa formatea en el idioma del
   navegador, y el resto de este archivo ya escribe los meses en español (ver SHORT_MONTHS).
   Mezclar las dos fuentes daría "hace 5 hours" en un navegador en inglés.

   Los meses son de 30 días y los años de 365. No es exacto y no hace falta que lo sea: esto
   dice hace cuánto pasó algo, no en qué fecha — para eso está la fecha completa en el title. */
export function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)

  // Debajo de este umbral cualquier número se lee raro ("hace 0 minutos").
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

/* La fecha completa, para el `title` de lo que muestra un timeAgo. "28 ago 2026, 14:05". */
export function formatDateTime(value) {
  const date = new Date(value)
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

  return `${formatShort(date)} ${date.getFullYear()}, ${time}`
}
