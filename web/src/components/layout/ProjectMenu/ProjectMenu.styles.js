/* Same box as the old static card (px-2 py-2, gap-2.5), so the tile keeps its place on the
   icons' centre line and nothing shifts when the rail collapses: the text only fades. */
export const TRIGGER = `flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-control px-2 py-2
  text-left transition-[background-color,box-shadow,scale] duration-base ease-ios
  enabled:active:scale-[0.98]`

export const TRIGGER_FRAME = 'bg-elevated shadow-hairline ring-[0.5px] ring-separator hover:shadow-card'

export const TRIGGER_BARE = 'hover:bg-fill-quaternary'

/* Collapsed, the bare tile keeps its hover fill while the menu is open. */
export const TRIGGER_BARE_OPEN = 'bg-fill-quaternary'

export const TILE = `brand-tile grid size-8 shrink-0 place-items-center rounded-lg
  font-display text-caption2 font-extrabold tracking-wide text-white`

export const TRIGGER_TEXT = 'min-w-0 flex-1 transition-opacity duration-fast ease-ios'

export const NAME = 'block truncate text-subheadline font-semibold text-label'

export const ROLE = 'block truncate text-caption text-label-secondary'

export const CHEVRON = 'size-4 shrink-0 text-label-secondary transition-opacity duration-fast ease-ios'

export const MENU = `absolute z-30 animate-fade-in rounded-control bg-elevated p-1 shadow-popover
  ring-[0.5px] ring-separator`

/* Expanded, the menu hangs below the card at its width; collapsed, it opens to the right of
   the tile, like the user menu does beside the avatar. */
export const MENU_BELOW = 'inset-x-0 top-full mt-1.5'

export const MENU_BESIDE = 'top-0 left-full ml-2 w-60'

export const ITEM = `flex min-h-11 w-full items-center gap-2.5 rounded-control-inner px-2 py-1.5
  text-left transition-colors duration-fast hover:bg-fill-tertiary
  focus-visible:bg-fill-tertiary focus-visible:outline-none`

export const ITEM_TILE = `brand-tile grid size-7 shrink-0 place-items-center rounded-md
  font-display text-[0.5625rem] font-extrabold tracking-wide text-white`

export const ITEM_ADD_TILE = 'grid size-7 shrink-0 place-items-center rounded-md bg-fill-tertiary text-label-secondary'

export const ITEM_TEXT = 'min-w-0 flex-1'

export const CHECK = 'size-4 shrink-0 text-blue'
