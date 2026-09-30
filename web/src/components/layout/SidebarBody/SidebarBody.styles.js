/* Card and user row share one inset (row px-2.5 + their own px-2 = 18px), so the logo tile
   and the avatar line up with the nav icons, and all three stay centred in the 68px rail. */
export const CARD_ROW = 'shrink-0 px-2.5 pt-3 pb-2'

export const CARD = `flex min-w-0 items-center gap-2.5 overflow-hidden rounded-control px-2 py-2
  transition-[background-color,box-shadow] duration-base ease-ios`

export const CARD_FRAME = 'bg-elevated shadow-hairline ring-[0.5px] ring-separator'

export const BRAND_TILE = `brand-tile grid size-8 shrink-0 place-items-center rounded-lg
  font-display text-caption2 font-extrabold tracking-wide text-white`

export const CARD_TEXT = 'min-w-0 transition-opacity duration-fast ease-ios'

export const CARD_NAME = 'truncate text-subheadline font-semibold text-label'

export const CARD_ROLE = 'truncate text-caption text-label-secondary'

/* `overflow-x-hidden` is not redundant: `overflow-y-auto` alone turns the x axis to `auto`
   too, and in the collapsed rail the faded labels (still laid out, nowrap) made it scroll
   sideways. */
export const NAV = 'flex flex-1 flex-col overflow-x-hidden overflow-y-auto px-2.5 pt-2 pb-3'

export const NAV_LIST = 'flex flex-col gap-0.5'

/* The collapse control sits above the user menu, on the icons' centre line, in both states:
   it never moves when the rail collapses. */
export const USER_ROW = 'hairline-t flex shrink-0 flex-col gap-1 px-2.5 py-2'
