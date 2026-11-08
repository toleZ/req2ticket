export const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-full font-semibold'

export const NEUTRAL = 'bg-fill-tertiary text-gray-text'

export const SIZE_CLASSES = {
  /* 11px initials at the small size too: 10px was under the smallest size the app uses for text. */
  sm: 'size-6 text-caption',
  md: 'size-8 text-caption',
}

/* The tint is stronger than a Badge's (/20, not /12): a circle this small with a /12 tint read
   as grey with a coloured letter in it. Text in the -text accent so it still reads at 4.5:1. */
export const TONE_CLASSES = {
  orange: 'bg-orange/20 text-orange-text',
  blue: 'bg-blue/20 text-blue-text',
  green: 'bg-green/20 text-green-text',
  purple: 'bg-purple/20 text-purple-text',
  yellow: 'bg-yellow/20 text-yellow-text',
  pink: 'bg-pink/20 text-pink-text',
  teal: 'bg-teal/20 text-teal-text',
  indigo: 'bg-indigo/20 text-indigo-text',
}
