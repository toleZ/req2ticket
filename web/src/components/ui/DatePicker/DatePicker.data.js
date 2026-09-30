export const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export const SHORT_MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

/* Monday first, as the calendar is drawn. `letter` heads the column, `name` is what a screen
   reader hears. X for miércoles is the usual Spanish way to tell it apart from martes. */
export const WEEKDAYS = [
  { letter: 'L', name: 'lunes' },
  { letter: 'M', name: 'martes' },
  { letter: 'X', name: 'miércoles' },
  { letter: 'J', name: 'jueves' },
  { letter: 'V', name: 'viernes' },
  { letter: 'S', name: 'sábado' },
  { letter: 'D', name: 'domingo' },
]

/* The panel's size, to place it before it exists: 280px wide (w-[17.5rem] in PANEL) and, at
   its tallest, header, weekday row, six weeks and the footer. */
export const PANEL_WIDTH = 280
export const PANEL_HEIGHT = 360

// The least distance the panel keeps from the sides of the screen.
export const GUTTER = 16
