/* `min-h-11 lg:min-h-0`: 44px to tap on a phone, the compact height from lg up. */
export const FILTER_SELECT = `min-h-11 w-auto rounded-control border border-separator bg-fill-tertiary
  px-2.5 py-1.5 text-footnote text-label disabled:opacity-50 lg:min-h-0`

/* The vertical padding is on the input, not the box: the input fills the box's height, so
   a tap anywhere on the box lands in it (with the padding on the box, its edges were dead). */
export const SEARCH_BOX = `flex min-h-11 w-full items-center gap-2 rounded-control border
  border-separator bg-fill-tertiary px-2.5 focus-ring-within lg:min-h-0`

export const SEARCH_INPUT = `w-full self-stretch bg-transparent py-1.5 text-footnote text-label
  placeholder:text-label-tertiary focus:outline-none`
