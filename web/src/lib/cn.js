import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/* The project's text sizes (--text-* in styles/theme.css). */
const FONT_SIZES = [
  'caption2',
  'caption',
  'footnote',
  'subheadline',
  'callout',
  'body',
  'headline',
  'title3',
  'title2',
  'title1',
  'largetitle',
]

/* The project's text colours (--color-* in styles/theme.css). */
const TEXT_COLORS = [
  'label',
  'label-secondary',
  'label-tertiary',
  'label-quaternary',
  'blue',
  'green',
  'red',
  'orange',
  'yellow',
  'purple',
  'pink',
  'teal',
  'indigo',
  'mint',
  'gray',
]

/* twMerge has to be told which of our `text-*` classes are sizes and which are colours.
   Without that it lumps them together and, seeing `text-body text-label`, keeps one and
   throws the other away — exactly the confusion styles/README.md describes under
   "text- means two different things".

   If you add a new token to theme.css, add it to the lists above as well. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      'text-color': [{ text: TEXT_COLORS }],
    },
  },
})

/* clsx resolves conditionals and falsy values; twMerge resolves conflicting Tailwind
   classes so the last one wins, instead of both landing in the DOM. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
