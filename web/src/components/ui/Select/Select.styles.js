/* `sheet`: the compact control of the create sheets and the detail side columns. */
export const TRIGGER = `flex min-h-11 w-full min-w-0 items-center gap-2 rounded-control border border-separator
  bg-elevated px-2 py-1 text-left text-footnote text-label transition-colors duration-fast
  hover:border-separator-opaque disabled:opacity-50 aria-invalid:border-red lg:min-h-8 lg:py-0.5`

/* `field`: a full-width form row. Same box as Field's CONTROL, so it lines up with a TextField. */
export const TRIGGER_FIELD = `flex min-h-11 w-full min-w-0 items-center gap-2 rounded-control border border-separator
  bg-fill-tertiary px-3 py-2 text-left text-body text-label transition-colors duration-fast
  hover:border-separator-opaque disabled:opacity-50 aria-invalid:border-red lg:min-h-0`

export const PANEL = `absolute inset-x-0 z-20 animate-pop-in rounded-control bg-elevated p-1 shadow-popover
  ring-[0.5px] ring-separator`

export const INNER_RADIUS = 'rounded-control-inner'

export const SEARCH_ROW = 'flex min-h-11 items-center gap-2 bg-fill-tertiary px-2 lg:min-h-8'

export const SEARCH_INPUT =
  'min-w-0 flex-1 self-stretch bg-transparent text-footnote text-label placeholder:text-label-tertiary focus:outline-none'

export const LIST = 'max-h-56 overflow-y-auto'

/* A <button>: full width and left-aligned so it reads as a row. Hover and Tab light it the same. */
export const OPTION = `flex min-h-11 w-full cursor-pointer items-center gap-2 px-2 text-left text-footnote text-label
  enabled:hover:bg-fill-tertiary focus-visible:bg-fill-tertiary focus-visible:outline-none lg:min-h-8`

/* An option that exists but cannot be picked right now (Activo while another sprint is). */
export const OPTION_DISABLED = 'cursor-not-allowed opacity-40'

/* An option with a `description`: two lines, so it grows and lines its dot and tick up with
   the first line instead of centring them. */
export const OPTION_TWO_LINES = 'items-start py-1.5 [&>svg]:mt-0.5 [&>span[aria-hidden]:first-child]:mt-1.5'

export const OPTION_DESCRIPTION = 'mt-0.5 block text-caption whitespace-normal text-label-secondary'
