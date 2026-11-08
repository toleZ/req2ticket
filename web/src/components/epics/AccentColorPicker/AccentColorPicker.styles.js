/* Two sizes, written out rather than composed: the create modal has a full-width column to
   spend, the detail modal's side column is 320px. */
export const SIZE_CLASSES = {
  md: 'size-7',
  sm: 'size-6',
}

/* The button is the tap area and the dot sits inside it: 44px below lg, where the pointer is
   a finger, and just the dot from lg up. The row's gap only opens from lg up, because below
   it the 44px areas already space the dots. */
export const ROW = 'flex flex-wrap lg:gap-2'

export const HIT_AREA = 'grid size-11 shrink-0 place-items-center rounded-full disabled:opacity-50 lg:size-auto'

export const SWATCH = 'block shrink-0 rounded-full transition-transform duration-fast'

export const SELECTED = 'scale-110 ring-2 ring-label ring-offset-2 ring-offset-elevated'
