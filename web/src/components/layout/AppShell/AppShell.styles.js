/* No overflow-hidden on the rail itself: the collapsed user menu opens beside it and must
   not be cut off. What could spill while the width animates clips on its own (the card, the
   nav's x axis, the user row). */
export const RAIL = `material-regular hairline-r sticky top-0 z-20 hidden h-screen shrink-0
  flex-col transition-[width] duration-base ease-ios lg:flex`

export const RAIL_EXPANDED = 'w-62'

export const RAIL_COLLAPSED = 'w-17'

export const SHELL = 'flex min-h-screen bg-base'

export const CONTENT = 'flex min-w-0 flex-1 flex-col'

/* A flex column so a page can take the height left below the top bar with `grow` (the board
   does, so its columns reach the bottom of the screen); other pages just stack from the top. */
export const MAIN = 'flex flex-1 flex-col px-4 py-6 md:px-6 lg:px-8'
