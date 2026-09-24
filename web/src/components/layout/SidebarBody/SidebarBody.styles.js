export const BRAND_ROW = 'flex h-14 shrink-0 items-center pr-3.5 pl-5'

export const BRAND_LINK = 'flex items-center gap-2.5'

export const BRAND_TILE = `brand-tile grid size-7 shrink-0 place-items-center rounded-lg
  font-display text-caption font-extrabold text-white`

export const BRAND_WORDMARK = `font-display whitespace-nowrap text-title3 text-label
  transition-opacity duration-fast ease-ios`

/* `overflow-x-hidden` is not redundant: `overflow-y-auto` alone turns the x axis to `auto`
   too, and in the collapsed rail the faded labels (still laid out, nowrap) made it scroll
   sideways. */
export const NAV = 'flex flex-1 flex-col overflow-x-hidden overflow-y-auto px-2.5 pb-3'

export const NAV_LIST = 'flex flex-col gap-0.5'

export const NAV_SECTION_HEADER = 'flex h-10 shrink-0 items-end px-3.75 pb-1'

export const COLLAPSE_ROW = 'flex shrink-0 items-center py-2 pl-4.5'
