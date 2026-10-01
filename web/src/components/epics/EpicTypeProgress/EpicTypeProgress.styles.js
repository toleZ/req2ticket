/* Side by side with the pending card, the top padding matches the card's so both headings
   sit on one line. Stacked under it, that padding would only be a gap. */
export const ROOT = '@3xl:pt-4'

export const HEADING = 'eyebrow font-sans'

export const LIST = 'mt-3 flex flex-col gap-3.5'

/* Icon | name | count on the first line, and the bar under the name only (col-start-2 on the
   bar), so it starts where the words start and stops short of the count. */
export const ITEM = 'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5'

export const LABEL = 'truncate text-footnote font-medium text-label'

export const COUNT = 'text-caption text-label-secondary tabular-nums'
