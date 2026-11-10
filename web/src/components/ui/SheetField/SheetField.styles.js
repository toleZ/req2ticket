import { cn } from '@/lib/cn'

/* The small uppercase label of the sheets. Its colour is left to the caller: the ticket's
   extra fields tint it by what they hold. */
export const SHEET_LABEL = 'mb-1.5 block text-caption font-semibold tracking-label uppercase'

export const SIDE_LABEL = cn(SHEET_LABEL, 'text-label-secondary')

export const FIELD_ERROR = 'mt-1 animate-fade-in text-footnote text-red-text'

/* A short explanation under a side field: why it reads as it does ("sigue a R2T-UH-3"). */
export const SIDE_NOTE = 'mt-1 text-caption text-label-secondary'

export const REQUIRED_NOTE = 'mr-auto text-caption text-label-secondary'

export const SHEET_TEXTAREA = `w-full resize-none rounded-control border border-separator
  bg-fill-tertiary px-3 py-2 text-body text-label transition-colors duration-fast
  placeholder:text-label-tertiary hover:border-separator-opaque disabled:opacity-50`

/* A text, date or number input in a sheet's side column: the same box as Select. */
export const SHEET_INPUT = `min-h-11 w-full min-w-0 rounded-control border border-separator bg-elevated px-2 py-1
  text-footnote text-label transition-colors duration-fast hover:border-separator-opaque
  placeholder:text-label-tertiary disabled:opacity-50 aria-invalid:border-red lg:min-h-8`
