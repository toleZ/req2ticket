export const BOX = `flex min-h-11 w-full items-center gap-2 rounded-control bg-fill-tertiary px-2.5
  transition-colors duration-fast hover:bg-fill-secondary focus-ring-within sm:w-72 lg:min-h-8`

export const KBD = `hidden h-5 min-w-5 place-items-center rounded-[5px] bg-fill-secondary px-1 text-caption2
  font-medium text-label-secondary sm:grid`

// The browser's own clear button is hidden: Escape clears the box instead.
export const INPUT =
  'min-w-0 flex-1 self-stretch bg-transparent text-footnote text-label placeholder:text-label-tertiary focus:outline-none [&::-webkit-search-cancel-button]:hidden'
