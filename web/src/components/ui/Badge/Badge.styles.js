export const BASE = 'inline-flex items-center whitespace-nowrap rounded-control px-2 py-0.5 text-caption font-medium'

/* Flat accent tokens only — see "Accents" in styles/README.md. The tint is the accent itself;
   the text uses its `-text` version, which is darker (light) or lighter (dark) so it reads at
   4.5:1. `neutral` covers statuses and priorities that don't warrant an accent. */
export const TONE_CLASSES = {
  blue: 'bg-blue/12 text-blue-text',
  green: 'bg-green/12 text-green-text',
  red: 'bg-red/12 text-red-text',
  orange: 'bg-orange/12 text-orange-text',
  yellow: 'bg-yellow/12 text-yellow-text',
  purple: 'bg-purple/12 text-purple-text',
  pink: 'bg-pink/12 text-pink-text',
  teal: 'bg-teal/12 text-teal-text',
  indigo: 'bg-indigo/12 text-indigo-text',
  mint: 'bg-mint/12 text-mint-text',
  gray: 'bg-gray/12 text-gray-text',
  /* Grey text from gray-text, not label-secondary: a neutral chip often sits inside a row
     that is already tinted, and on that double tint label-secondary fell to 4.3:1. */
  neutral: 'bg-fill-tertiary text-gray-text',
  /* Neutral and struck through: a state that ended without being done (a cancelled ticket). */
  struck: 'bg-fill-tertiary text-gray-text line-through',
}
