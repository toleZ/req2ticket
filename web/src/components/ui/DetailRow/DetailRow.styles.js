/* Label and value are both one control tall (44px below lg, 32px from lg up), so every row
   in the side column has the same height whatever it holds. */
export const DETAIL_ROW = 'grid grid-cols-[5rem_1fr] items-start gap-2 py-1'

export const DETAIL_LABEL = 'flex min-h-11 items-center text-footnote text-label-secondary lg:min-h-8'

export const DETAIL_VALUE = 'flex min-h-11 min-w-0 items-center justify-end gap-1.5 lg:min-h-8'

/* 44px tall below lg, where the pointer is a finger; 32px from lg up, like SearchSelect. */
export const SIDE_SELECT = `min-h-11 w-full min-w-0 rounded-control border border-separator bg-elevated px-2 py-1
  lg:min-h-8
  text-footnote text-label transition-colors duration-fast hover:border-separator-opaque
  disabled:opacity-50`
