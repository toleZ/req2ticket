/* The row the epic and sprint lists share: a filled block, a chevron that discloses the row's
   tickets, and the panel that opens under it. One look for "a thing that holds tickets". */
export const ROW = 'rounded-control bg-fill-tertiary px-3 py-2.5'

/* The row is already bg-fill-tertiary, so the chevron hovers to fill-secondary: the usual
   fill-tertiary hover would be invisible here. The negative margin grows the tap area to 44px
   below lg without moving the row. */
export const EXPAND_BUTTON = `-m-2.5 -mt-2 grid size-11 shrink-0 place-items-center rounded-control lg:m-0 lg:mt-0.5 lg:size-6
  text-label-secondary transition-colors duration-fast ease-out-quad hover:bg-fill-secondary
  hover:text-label`

export const CHEVRON = 'size-4 transition-transform duration-fast ease-out-quad'

/* Indented past the chevron so the panel reads as the row's own content. */
export const PANEL = 'ml-8 mt-3 border-t border-separator pt-3'

export const PANEL_LABEL = 'text-footnote font-medium text-label-secondary'

export const META = 'text-caption text-label-secondary'
