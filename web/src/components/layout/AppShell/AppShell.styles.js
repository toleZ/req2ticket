export const RAIL = `material-regular hairline-r sticky top-0 z-20 hidden h-screen shrink-0
  flex-col overflow-hidden transition-[width] duration-base ease-ios lg:flex`

export const RAIL_EXPANDED = 'w-62'

export const RAIL_COLLAPSED = 'w-17'

export const SHELL = 'flex min-h-screen bg-base'

export const CONTENT = 'flex min-w-0 flex-1 flex-col'

/* `focus:outline-none`: <main> is only focused by the skip link, to move the keyboard there;
   it is a landmark, not a control, and a ring around the whole page says nothing. */
export const MAIN = 'flex-1 px-4 py-6 focus:outline-none md:px-6 lg:px-8'

/* Hidden until it has the keyboard focus. It is the first thing Tab reaches, so a keyboard
   user can skip the rail's links instead of tabbing through all of them on every page. */
export const SKIP_LINK = `sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
  focus:rounded-control focus:bg-elevated focus:px-3 focus:py-2 focus:text-subheadline
  focus:font-medium focus:text-label focus:shadow-popover`
