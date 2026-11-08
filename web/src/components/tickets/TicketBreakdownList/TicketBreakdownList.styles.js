/* The page's own background, punched into the row: it reads as a well inside the epic or
   sprint rather than a card stacked on it. Its own @container so the columns below follow the card's width.
   `self-start`: beside a tall aside (a sprint with nine people) a stretched card was mostly
   empty well; it keeps the height of what it holds instead. */
export const CARD = '@container flex flex-col self-start rounded-card bg-base p-4'

/* `eyebrow` is the app's section title (index.css). font-sans because h3 brings Manrope, and
   these small caps are set in Inter everywhere else. */
export const HEADING = 'eyebrow font-sans'

export const HINT = 'text-caption text-label-secondary'

/* One grid for the whole list, and each row a subgrid of it: that is what lines the titles,
   badges and points up in columns even though every code and badge is a different width.
   Narrow, the code and the assignee drop out (they are hidden, so they take no cell) and four
   columns remain: icon, title, status, points. */
export const LIST = `mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-3
  @md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto]`

export const ITEM = 'col-span-full grid grid-cols-subgrid'

/* 44px tall below lg, where the pointer is a finger. The py-1 is for a title that wraps. */
export const ROW = 'group col-span-full grid min-h-11 grid-cols-subgrid items-center py-1 text-left lg:min-h-8'

/* TicketSummaryList's title, except narrow: there the title is what is left once the status
   and points have their room, and one truncated line cut it to two words. It wraps to two
   lines instead, and goes back to one line with an ellipsis once the card is wide. */
export const TITLE = `line-clamp-2 min-w-0 text-footnote text-label underline-offset-2 group-hover:underline
  group-hover:decoration-label-tertiary @md:line-clamp-1`

/* Struck and in the secondary grey, not dimmed with opacity: opacity would take the text under
   4.5:1 on the dark well. The hover still underlines it — it still opens. */
export const TITLE_CANCELLED = 'text-label-secondary line-through'

export const CODE_COLUMN = 'hidden @md:block'

export const STATUS_COLUMN = 'justify-self-end'

export const ASSIGNEE_COLUMN = 'hidden @md:inline-flex'

export const POINTS_COLUMN = 'text-right tabular-nums'

export const EMPTY = 'mt-2 text-footnote text-label-secondary'

export const FOOTER = 'flex flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-3'

export const MORE = 'mr-auto text-caption text-label-secondary'

/* A link, so it looks like one: blue text, no button chrome. The arrow nudges on hover to say
   it goes somewhere else. The negative margin grows the tap area without moving the text. */
export const LINK = `group -m-2 inline-flex min-h-11 items-center gap-1 rounded-control p-2 text-footnote
  font-medium text-blue-text lg:min-h-0`

export const LINK_ARROW = 'size-3.5 transition-transform duration-fast ease-out-quad group-hover:translate-x-0.5'
