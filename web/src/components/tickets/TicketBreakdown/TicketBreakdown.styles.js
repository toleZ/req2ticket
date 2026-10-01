/* `@container` makes the panel lay itself out by its own width, not the window's: the epic
   and sprint lists sit next to a sidebar that collapses, so the same window can leave them
   wide or narrow. `@3xl:` below means "once this panel is at least 48rem wide". */
export const ROOT = '@container'

export const SUMMARY = 'flex flex-wrap items-baseline gap-x-2.5 gap-y-1'

/* The one big number in the row. Manrope like every other figure, tabular so a 79% → 80%
   does not jiggle the line beside it. */
export const PERCENT = `font-display text-title1 text-label tabular-nums transition-colors duration-base
  ease-out-quad`

/* At 100% the number turns the "Hecho" green: the one moment the figure is news. It fades
   into the green (transition-colors above) rather than switching, so it reads as arriving. */
export const PERCENT_DONE = 'text-green-text'

export const TOTALS = 'text-footnote text-label-secondary tabular-nums'

/* The notes on the right of the summary (the `note` slot, then the cancelled count). Pushed
   right while they fit on the line; they wrap under the totals when they do not. */
export const NOTES = 'ml-auto flex flex-wrap items-baseline gap-x-3 gap-y-1'

export const CANCELLED_NOTE = 'text-caption text-label-secondary'

/* The segments are sized with flex-grow by their ticket count, so they always add up to the
   full width with the gaps taken out — percentages plus gaps would overflow. It draws itself
   left to right as the panel opens (animate-wipe-in); with reduced motion it just appears. */
export const BAR = 'mt-3 flex h-2 w-full gap-0.5 overflow-hidden rounded-full animate-wipe-in'

/* Every ticket cancelled leaves nothing in the bar: the empty track says so. */
export const BAR_EMPTY = 'bg-fill-secondary'

/* `basis-0` so the width comes only from flex-grow; `min-w-1` so a single ticket among
   eighty still shows as a sliver instead of vanishing.

   flex-grow is transitioned: when a ticket changes status with the panel open, the boundary
   between two segments slides instead of jumping, so you see where the ticket went. With
   reduced motion index.css narrows transitions to colour and opacity, and it lands at once. */
export const SEGMENT = `h-full min-w-1 basis-0 rounded-full transition-[flex-grow,opacity] duration-base
  ease-out-quad`

/* While one status is picked in the legend, the rest of the bar steps back so the picked
   segment is the one you see. */
export const SEGMENT_DIMMED = 'opacity-30'

/* The legend's entries are buttons with their own padding, so the gap between them is small
   and the negative margin keeps the first dot aligned with the bar's left edge. */
export const LEGEND = '-mx-1.5 mt-2 flex flex-wrap gap-x-1 gap-y-0.5'

/* 44px tall below lg, where the pointer is a finger. Pressed, it keeps the fill — that and
   the dimmed bar are what say "the list below is showing this status".

   The press gives slightly under the finger, like the app's Buttons (Button.styles BASE). */
export const LEGEND_BUTTON = `flex min-h-11 items-center gap-1.5 rounded-control px-1.5 text-footnote tabular-nums
  transition-[background-color,scale] duration-fast ease-out-quad hover:bg-fill-secondary active:scale-[0.97]
  aria-pressed:bg-fill-secondary lg:min-h-7`

export const DOT = 'size-2 shrink-0 rounded-full'

/* Hollow: the cancelled tickets are listed but are not part of the bar above. */
export const DOT_HOLLOW = 'border border-gray'

export const LEGEND_LABEL = 'font-medium text-label'

export const LEGEND_POINTS = 'text-label-secondary'

export const COLUMNS = 'mt-4 grid gap-5'

/* With an aside (the epic's "Por tipo"): stacked when narrow, side by side once the panel is
   wide enough for the list to keep its code and assignee columns next to a 14rem column. */
export const COLUMNS_WITH_ASIDE = '@3xl:grid-cols-[minmax(0,1fr)_14rem] @3xl:gap-6'

/* ---- The aside ----
   The column beside the list (EpicTypeProgress today). Kept here, not in that component, so
   a second aside starts from the same look instead of a copy of it. */

/* Side by side with the list card, the top padding matches the card's so both headings sit
   on one line. Stacked under it, that padding would only be a gap. */
export const ASIDE = '@3xl:pt-4'

/* `eyebrow` is the app's section title (index.css). font-sans because h3 brings Manrope, and
   these small caps are set in Inter everywhere else. */
export const ASIDE_HEADING = 'eyebrow font-sans'

export const ASIDE_LIST = 'mt-3 flex flex-col gap-3.5'

/* Marker | name | count on the first line, and the bar under the name only (col-start-2 on
   the bar), so it starts where the words start and stops short of the count. */
export const ASIDE_ITEM = 'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5'

export const ASIDE_LABEL = 'truncate text-footnote font-medium text-label'

export const ASIDE_COUNT = 'text-caption text-label-secondary tabular-nums'
