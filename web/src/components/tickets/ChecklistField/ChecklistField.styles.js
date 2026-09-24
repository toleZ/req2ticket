export const ITEM = `group flex items-center gap-2.5 rounded-control px-1.5 py-1.5 transition-colors
  duration-fast hover:bg-fill-quaternary`

export const CIRCLE = `grid size-4.5 shrink-0 place-items-center rounded-full border border-separator-opaque
  text-white transition-colors duration-fast
  peer-focus-visible:ring-3 peer-focus-visible:ring-blue/55 peer-disabled:opacity-50`

/* Hidden until hover only from lg up. Below it the pointer is usually a finger, which has no
   hover, so the button stays visible — hiding it there meant an item could not be removed. */
export const REMOVE_BUTTON = `-my-2.5 grid size-11 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast lg:my-0 lg:size-6 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100
  hover:bg-red/12 hover:text-red disabled:opacity-50`

/* The row sets the tap height (44px below lg, 24px of input from lg up): the "+" keeps its
   18px footprint through negative margins, so the input stretches to the row, not to it. */
export const ADD_ROW = `flex min-h-11 items-center gap-2.5 rounded-control px-1.5 focus-ring-within
  lg:min-h-9 lg:py-1.5`

/* Drawn the size of the item circles above (18px) so the "+" lines up with them, but tappable:
   the negative margins grow the hit area to 44px (24px from lg up) without moving the row's
   text or making it taller. */
export const ADD_BUTTON = `-m-3.25 grid size-11 shrink-0 place-items-center rounded-control text-label-tertiary
  lg:-m-0.75 lg:size-6
  transition-colors duration-fast hover:bg-fill-tertiary hover:text-label disabled:opacity-50`

/* `self-stretch`: as tall as the row (44px below lg), so it is as easy to tap as the button. */
export const ADD_INPUT = `min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 text-footnote text-label
  placeholder:text-label-tertiary focus:outline-none disabled:opacity-50`
