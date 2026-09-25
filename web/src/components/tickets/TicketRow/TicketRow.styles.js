/* Two layouts, one markup.

   Below xl the row is two lines: icon, code and title on the first, the chips wrapping on the
   second (META). One line did not fit a phone: the chips cannot shrink, so the title — the
   only thing that could — collapsed to nothing and the row spilled out of the screen.

   From xl up it is one line of fixed columns, so every row's epic, sprint, priority and
   points sit at the same x and a column can be scanned top to bottom. Each <li> is its own
   grid, so only the title may be flexible: an `auto` column would size per row and break the
   alignment. META turns into `contents` there, which hands its children to the row's grid. */
export const ROW = `group grid w-full grid-cols-[1rem_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5
  rounded-control bg-fill-tertiary px-2.5 py-2 text-left
  xl:grid-cols-[1rem_6rem_minmax(0,1fr)_8rem_5.5rem_5rem_4.5rem_3rem_1.5rem]`

export const CODE = `text-caption text-label-secondary transition-colors duration-fast
  ease-out-quad group-hover:text-label`

export const TITLE = `truncate text-subheadline text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

export const META = 'col-span-3 flex flex-wrap items-center gap-2 pl-6 xl:contents'

/* An empty cell takes no room in the wrapping line but keeps its column on xl. */
export const CELL = 'flex min-w-0 items-center empty:hidden xl:empty:flex'

/* A badge inside a fixed column: it can shrink, and its text truncates instead of overflowing. */
export const CELL_BADGE = 'max-w-full'

export const POINTS = 'text-caption font-medium text-label-secondary xl:text-right'
