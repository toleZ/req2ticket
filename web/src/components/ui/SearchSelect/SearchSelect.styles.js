export const TRIGGER = `flex min-h-11 w-full min-w-0 items-center gap-2 rounded-control border border-separator
  bg-elevated px-2 py-1 text-left text-footnote text-label transition-colors duration-fast
  hover:border-separator-opaque disabled:opacity-50 aria-invalid:border-red lg:min-h-8 lg:py-0.5`

export const PANEL = `absolute inset-x-0 z-20 animate-pop-in rounded-control bg-elevated p-1 shadow-popover
  ring-[0.5px] ring-separator`

export const INNER_RADIUS = 'rounded-control-inner'

export const SEARCH_ROW = 'flex min-h-11 items-center gap-2 bg-fill-tertiary px-2 lg:min-h-8'

export const SEARCH_INPUT =
  'min-w-0 flex-1 self-stretch bg-transparent text-footnote text-label placeholder:text-label-tertiary focus:outline-none'

export const OPTION = `flex min-h-11 cursor-pointer items-center gap-2 px-2 text-footnote text-label lg:min-h-8`
