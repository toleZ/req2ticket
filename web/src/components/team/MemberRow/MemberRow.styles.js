/* A hairline between rows and none above the first: the header already draws that one. */
export const ROW = 'not-first:hairline-t'

export const CELL = 'px-4 py-3 align-middle'

export const ROLE_CELL = `hidden ${CELL} sm:table-cell`

export const NAME = 'truncate text-body font-medium text-label'

export const EMAIL = 'truncate text-footnote text-label-secondary'

/* The negative margin lines the last icon's glyph up with the cell's padding instead of the
   button's own: the buttons are wider than the icons they draw. */
export const ACTIONS = '-mr-2 flex items-center justify-end gap-0.5'

/* Sized like an IconButton so a locked row's padlock sits where the bin would be. */
export const LOCK = 'grid size-11 place-items-center text-label-tertiary lg:size-8'
