export const HEADER = 'flex flex-wrap items-center gap-x-4 gap-y-3'

export const TITLE_ROW = 'flex min-w-0 items-baseline gap-3'

export const META = 'mono text-caption text-label-secondary tabular-nums'

/* Always at the right. When it holds a search box it takes the full width below sm, so the
   box can stretch; a page with only a button keeps it beside the title. */
export const ACTIONS = 'ml-auto flex items-center gap-2 has-[input]:w-full sm:has-[input]:w-auto'
