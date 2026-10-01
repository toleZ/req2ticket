/* Opens the sprint's sheet. Same as the epic row's (see EpicRow.styles): only the name and
   what sits beside it is clickable, and the hover underlines the name instead of painting. */
export const OPEN_BUTTON = 'group flex min-h-11 min-w-0 flex-wrap items-center gap-2 text-left lg:min-h-6'

/* The sprint's name is the row's title, a step above the epic rows' names: a sprint is a
   period the team lives in, and the list is a handful of them, not dozens. h2 already brings
   Manrope at 700. */
export const OPEN_NAME = `text-title2 text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

export const GOAL = 'mt-1 flex max-w-prose items-start gap-1.5 text-subheadline text-label-secondary'

export const DATES = 'mt-1 flex items-start gap-1.5 text-footnote text-label-secondary tabular-nums'

/* The flag and the calendar in front of the goal and the dates. Tertiary is allowed here: it is
   an icon, and the words beside it carry the meaning. The top margin centres it on the first
   line when the goal wraps. */
export const LINE_ICON = 'mt-0.5 size-3.5 shrink-0 text-label-tertiary'

/* Past capacity the note turns orange and says it in words, not only with the colour. */
export const OVER_CAPACITY = 'text-caption text-orange-text'

export const EMPTY_NOTE = 'text-footnote text-label-secondary'

/* Why "Iniciar" is disabled, said where the button is and not only in the page header. */
export const BLOCKED_NOTE = 'mt-1.5 text-footnote text-label-secondary'
