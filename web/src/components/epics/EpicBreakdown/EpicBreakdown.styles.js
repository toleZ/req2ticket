/* `@container` makes the panel lay itself out by its own width, not the window's: the epic
   list sits next to a sidebar that collapses, so the same window can leave it wide or narrow.
   `@3xl:` below means "once this panel is at least 48rem wide". */
export const ROOT = '@container'

export const SUMMARY = 'flex flex-wrap items-baseline gap-x-2.5 gap-y-1'

/* The one big number in the row. Manrope like every other figure, tabular so a 79% → 80%
   does not jiggle the line beside it. */
export const PERCENT = 'font-display text-title1 text-label tabular-nums'

export const TOTALS = 'text-footnote text-label-secondary tabular-nums'

/* Pushed to the right while it fits on the line; it wraps under the totals when it does not. */
export const CANCELLED_NOTE = 'ml-auto text-caption text-label-secondary'

/* The segments are sized with flex-grow by their ticket count, so they always add up to the
   full width with the gaps taken out — percentages plus gaps would overflow. It draws itself
   left to right as the panel opens (animate-wipe-in); with reduced motion it just appears. */
export const BAR = 'mt-3 flex h-2 w-full gap-0.5 overflow-hidden rounded-full animate-wipe-in'

/* An epic whose every ticket is cancelled has nothing in the bar: the empty track says so. */
export const BAR_EMPTY = 'bg-fill-secondary'

/* `basis-0` so the width comes only from flex-grow; `min-w-1` so a single ticket among
   eighty still shows as a sliver instead of vanishing. */
export const SEGMENT = 'h-full min-w-1 basis-0 rounded-full'

export const LEGEND = 'mt-3 flex flex-wrap gap-x-5 gap-y-1.5'

export const LEGEND_ITEM = 'flex items-center gap-1.5 text-footnote tabular-nums'

export const DOT = 'size-2 shrink-0 rounded-full'

/* Hollow: the cancelled tickets are listed but are not part of the bar above. */
export const DOT_HOLLOW = 'border border-gray'

export const LEGEND_LABEL = 'font-medium text-label'

export const LEGEND_POINTS = 'text-label-secondary'

/* Stacked when narrow; side by side once the panel is wide enough for the pending list to
   keep its code and assignee columns next to a 14rem type column. */
export const COLUMNS = 'mt-5 grid gap-5 @3xl:grid-cols-[minmax(0,1fr)_14rem] @3xl:gap-6'
