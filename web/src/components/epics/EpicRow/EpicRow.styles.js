/* Named EXPAND_BUTTON and not TOGGLE_BUTTON: SprintCard has a constant by that name which is
   a full-width bordered text row, and this is a size-6 chevron button. Same name, nothing else
   in common. */
/* The negative margin grows the tap area to 44px below lg without moving the row. */
export const EXPAND_BUTTON = `-m-2.5 -mt-2 grid size-11 shrink-0 place-items-center rounded-control lg:m-0 lg:mt-0.5 lg:size-6
  text-label-secondary transition-colors duration-fast ease-out-quad hover:bg-fill-secondary
  hover:text-label`

/* The clickable area is only the code and the name, not the whole row. Deliberately: the
   chevron sits next to it, and below, once expanded, is the ticket list, which are buttons
   too. If the click lived on the <li>, every one of those would need its own
   e.stopPropagation(), and forgetting one looks like "opening a ticket also opens the epic".

   The hover paints NO background. Painting it left a grey slab wrapping half the row —
   coloured badges included — and read as a patch, not as something clickable. What it
   announces is what a link announces: the name underlines and the code climbs a step of grey. */
export const OPEN_BUTTON = 'group flex min-h-11 min-w-0 flex-wrap items-center gap-2 text-left lg:min-h-6'

export const OPEN_CODE = `text-caption text-label-secondary transition-colors duration-fast ease-out-quad
  group-hover:text-label`

/* `decoration-label-tertiary`: that line inherits the text colour unless told otherwise, and
   a black rule beneath a black name is far too heavy for a hover. */
export const OPEN_NAME = `text-body font-medium text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

export const CHEVRON = 'size-4 transition-transform duration-fast ease-out-quad'

export const OWNER_NAME = 'text-footnote font-normal text-label-secondary'

export const PANEL_LABEL = 'text-footnote font-medium text-label-secondary'
