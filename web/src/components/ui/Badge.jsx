import { cn } from '@/lib/cn'

/* Flat accent tokens only — see "Acentos" in styles/README.md. `neutral` covers
   statuses/priorities that don't warrant an accent. */
const TONE_CLASSES = {
  blue: 'bg-blue/12 text-blue',
  green: 'bg-green/12 text-green',
  red: 'bg-red/12 text-red',
  orange: 'bg-orange/12 text-orange',
  yellow: 'bg-yellow/12 text-yellow',
  purple: 'bg-purple/12 text-purple',
  pink: 'bg-pink/12 text-pink',
  teal: 'bg-teal/12 text-teal',
  indigo: 'bg-indigo/12 text-indigo',
  mint: 'bg-mint/12 text-mint',
  gray: 'bg-gray/12 text-gray',
  neutral: 'bg-fill-tertiary text-label-secondary',
}

export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-control px-2 py-0.5 text-caption font-medium',
        TONE_CLASSES[tone] ?? TONE_CLASSES.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}
