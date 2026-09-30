/* Same box as SearchSelect's trigger and SHEET_INPUT, so a date sits in a side column like any
   other control. While the panel is open the edge turns blue: it says which field the calendar
   belongs to when two date fields are stacked. */
export const TRIGGER = `flex min-h-11 w-full min-w-0 items-center gap-2 rounded-control border border-separator
  bg-elevated px-2 py-1 text-left text-footnote text-label tabular-nums transition-colors duration-fast
  hover:border-separator-opaque aria-expanded:border-blue disabled:opacity-50 aria-invalid:border-red
  lg:min-h-8 lg:py-0.5`

/* `fixed` and placed by the component from the trigger's box (see openPanel). The width is
   PANEL_WIDTH in DatePicker.data.js: change both together. */
export const PANEL = `fixed z-20 w-[17.5rem] animate-pop-in rounded-card bg-elevated p-2 shadow-popover
  ring-[0.5px] ring-separator`

export const HEADER = 'flex items-center gap-1 pb-1 pl-2'

export const TITLE = 'flex-1 text-headline text-label'

export const NAV_BUTTON = `flex size-11 items-center justify-center rounded-full text-blue-text
  transition-colors duration-fast hover:bg-fill-tertiary lg:size-8`

export const WEEKDAY = 'flex h-7 items-center justify-center text-caption font-semibold text-label-tertiary'

export const CELL = 'relative flex h-10 items-center justify-center lg:h-9'

/* The band that joins the two ends of a sprint behind the day circles. */
export const BAND = 'absolute inset-y-1 bg-blue/12'

export const DAY = `relative flex size-9 items-center justify-center rounded-full text-subheadline
  transition-colors duration-fast lg:size-8`

export const DAY_DEFAULT = 'text-label hover:bg-fill-tertiary'

export const DAY_OUTSIDE = 'text-label-tertiary hover:bg-fill-tertiary'

export const DAY_SELECTED = 'bg-blue font-semibold text-white'

/* The other end of the range: the start date seen from "Fin", or the end seen from "Inicio". */
export const DAY_OTHER_END = 'font-semibold text-blue-text ring-1 ring-inset ring-blue/50 hover:bg-blue/12'

export const DAY_DISABLED = 'cursor-not-allowed text-label-quaternary'

/* Today is marked with a dot under the number, in the day's own colour, so it still shows on
   the blue of a selected day. */
export const TODAY_DOT = 'absolute bottom-1 size-1 rounded-full bg-current'

export const FOOTER = 'hairline-t mt-1 flex items-center gap-2 px-1 pt-2'

export const TODAY_BUTTON = `min-h-11 rounded-control-inner px-2 text-subheadline font-medium text-blue-text
  transition-colors duration-fast hover:bg-blue/12 disabled:text-label-quaternary disabled:hover:bg-transparent
  lg:min-h-7`

export const DURATION = 'ml-auto text-footnote text-label-secondary tabular-nums'
