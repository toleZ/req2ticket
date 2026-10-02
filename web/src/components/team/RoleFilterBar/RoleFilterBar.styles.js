export const GROUP = 'flex flex-wrap items-center gap-1'

/* Unselected pills have no fill at all, so seven of them read as one quiet row; the chosen one
   takes the filled surface of the app's neutral buttons. The focus ring is drawn on the label
   because the radio inside is visually hidden. */
export const OPTION = `flex min-h-11 cursor-pointer items-center gap-1.5 rounded-control px-2.5 text-footnote
  font-medium text-label-secondary transition-colors duration-fast ease-out-quad hover:text-label
  has-checked:bg-fill-tertiary has-checked:text-label focus-ring-within lg:min-h-8`

export const DOT = 'size-1.5 shrink-0 rounded-full'

export const COUNT = 'font-normal tabular-nums text-label-secondary'
