/* Opens the sprint's sheet. Same as the epic row's (see EpicRow.styles): only the name and
   what sits beside it is clickable, and the hover underlines the name instead of painting. */
export const OPEN_BUTTON = 'group flex min-h-11 min-w-0 flex-wrap items-center gap-2 text-left lg:min-h-6'

export const OPEN_NAME = `text-body font-medium text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

export const DATES = 'text-footnote text-label-secondary'

export const GOAL = 'mt-1 max-w-prose text-footnote text-label-secondary'

/* Past capacity the note turns orange and says it in words, not only with the colour. */
export const OVER_CAPACITY = 'text-caption text-orange-text'

export const EMPTY_NOTE = 'mt-1.5 text-footnote text-label-secondary'

/* Why "Iniciar" is disabled, said where the button is and not only in the page header. */
export const BLOCKED_NOTE = 'mt-1.5 text-footnote text-label-secondary'
