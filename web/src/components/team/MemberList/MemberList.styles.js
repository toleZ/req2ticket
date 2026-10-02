export const WRAP = 'mt-4 overflow-hidden rounded-card bg-elevated shadow-card surface-highlight ring-[0.5px] ring-separator'

/* `table-fixed` hands the leftover width to the first column, which is what lets a long name
   or email truncate instead of shoving the role off the edge. */
export const TABLE = 'w-full table-fixed text-left'

export const HEAD = 'hairline-b'

export const HEAD_CELL = 'eyebrow px-4 py-2.5 font-semibold'

/* Below sm the role moves under the email (see MemberRow), so its column goes. */
export const ROLE_COL = 'hidden w-44 sm:table-cell'

/* Two icon buttons and the cell's padding: 44px buttons below lg, 32px from lg up. */
export const ACTIONS_COL = 'w-30 lg:w-24'
