/* The same well as the list card it replaces (TicketBreakdownList's CARD), so the panel keeps
   its shape when the last pending ticket is done and the list turns into this. */
export const CARD = `@container grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-card bg-base
  p-4 @lg:grid-cols-[auto_minmax(0,1fr)_auto] @lg:p-5`

/* A tint of the "Hecho" green behind the check: the one place the panel uses colour, and it
   says the same thing the green 100% above it does.

   The panel's one moment: the badge pops in (tick-in) and the check draws its stroke right
   after (check-draw on the path; the circle stays whole). It plays when the panel appears —
   on opening a finished sprint, or the instant the last pending ticket is done. Reduced
   motion shortens both to nothing, and the check is simply there. */
export const BADGE = 'grid size-10 shrink-0 animate-tick-in place-items-center self-start rounded-full bg-green/12'

export const ICON = 'size-5 text-green [&_path]:animate-check-draw [&_path]:[stroke-dasharray:12]'

export const TITLE = 'text-title3 text-label'

export const TEXT = 'mt-0.5 text-footnote text-label-secondary'

export const ACTIONS = 'mt-3 flex flex-wrap gap-2'

/* Under the text when narrow, at the right end of the row once there is room — bottom-aligned
   with the buttons when there are some, centred with the text when there are none. */
export const LINK_CELL = 'col-span-full justify-self-end @lg:col-span-1 @lg:self-end'
