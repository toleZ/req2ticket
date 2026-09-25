/* Named EXPAND_ROW and not TOGGLE_BUTTON: EpicRow has a constant by that name which is a
   size-6 chevron button, and this is a full-width bordered text row. Same name, nothing
   else in common. */
export const EXPAND_ROW = `mt-3 min-h-11 w-full border-t border-separator pt-3 text-left text-subheadline lg:min-h-0
  text-label-secondary transition-colors duration-fast hover:text-label`

export const CARD = 'rounded-card bg-elevated p-5 shadow-card ring-[0.5px] ring-separator'

export const GOAL = 'mt-1.5 flex max-w-prose items-start gap-1.5 text-body text-label-secondary'

export const DATES = 'mt-1 flex items-center gap-1.5 text-footnote text-label-secondary'

export const PROGRESS_META = 'flex items-center justify-between text-footnote text-label-secondary'

export const STAT_LABEL = 'text-caption font-medium tracking-wide text-label-secondary uppercase'

export const EMPTY_NOTE = 'px-0.5 pb-0.5 text-footnote text-label-secondary'
