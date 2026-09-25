/* Filled, never outlined — the same surface as the app's neutral buttons. An active chip
   takes the blue tint every "on" state uses (the active nav item, a pressed toggle). */
export const CHIP = `inline-flex min-h-11 items-stretch rounded-control text-footnote transition-colors
  duration-fast ease-out-quad lg:min-h-8`

export const CHIP_IDLE = 'bg-fill-tertiary text-label hover:bg-fill-secondary'

export const CHIP_ACTIVE = 'bg-blue/12 text-blue-text'

export const CHIP_MAIN = 'flex items-center gap-1.5 px-2.5 font-medium'

export const CHIP_CLEAR = `grid w-9 place-items-center rounded-r-control transition-colors duration-fast
  hover:bg-blue/12 lg:w-7`

export const COUNT = `grid h-4.5 min-w-4.5 place-items-center rounded-[5px] bg-blue px-1 text-caption2
  font-semibold text-white`

export const PANEL = `absolute top-full z-30 mt-1 w-64 origin-top animate-pop-in rounded-control bg-elevated p-1
  shadow-popover ring-[0.5px] ring-separator`

export const INNER = 'rounded-[calc(var(--radius-control)-0.25rem)]'

export const OPTION = `flex min-h-11 cursor-pointer items-center gap-2.5 px-2.5 text-footnote text-label
  hover:bg-fill-tertiary has-focus-visible:bg-fill-tertiary lg:min-h-8`

export const SEARCH_ROW = 'mb-1 flex min-h-11 items-center gap-2 bg-fill-tertiary px-2.5 lg:min-h-8'

export const SEARCH_INPUT =
  'min-w-0 flex-1 self-stretch bg-transparent text-footnote text-label placeholder:text-label-tertiary focus:outline-none'

export const CHEVRON = 'size-3.5 shrink-0 transition-[rotate] duration-fast'

export const NO_MATCHES = 'px-2.5 py-2 text-footnote text-label-secondary'
