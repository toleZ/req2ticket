/* Phones: the columns sit in a row that scrolls sideways and snaps, one column per screen.
   From lg: five columns across the width. The negative margin lets the row bleed to the edges
   of the page on phones, so the next column peeks in.
   `grow`: the row takes the height left on the page (Board's section is a flex column), and
   every column stretches to it — or, when cards overflow, to the tallest column, all alike. */
export const COLUMNS =
  '-mx-4 flex grow snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0'

/* The card's own focus ring follows its rounded corners. touch-manipulation keeps swiping
   (scrolling between columns) working; a long press is what starts a drag on touch screens. */
export const CARD_HANDLE =
  'touch-manipulation select-none rounded-card outline-none focus-visible:ring-3 focus-visible:ring-blue/55'
