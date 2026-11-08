/* One per screen on phones (they scroll sideways and snap); five across from lg. */
export const COLUMN =
  'flex w-[85vw] shrink-0 snap-start flex-col rounded-group bg-grouped p-2 transition-[opacity,box-shadow] duration-fast ease-out-quad sm:w-72 lg:w-auto lg:min-w-0 lg:flex-1'

/* A card is being dragged and may not land here. */
export const COLUMN_BLOCKED = 'opacity-45'

/* A card is over this column and may land: a blue ring says "here". */
export const COLUMN_OVER = 'ring-2 ring-blue/55'

export const HEADER = 'flex items-center justify-between px-1.5 pb-2 pt-1'

export const REASON = 'mx-1 mb-2 animate-fade-in rounded-control bg-fill-tertiary px-2 py-1.5 text-footnote text-label'

export const BODY = 'flex min-h-24 flex-1 flex-col gap-2'

export const EMPTY =
  'grid min-h-20 flex-1 place-items-center rounded-card border border-dashed border-separator-opaque text-footnote text-label-secondary'
