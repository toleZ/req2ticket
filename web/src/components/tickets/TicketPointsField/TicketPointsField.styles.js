export const GROUP = 'flex flex-wrap gap-1 rounded-control bg-fill-tertiary p-1'

/* 44px chips below lg so each point is tappable; from lg up the strip keeps its compact size,
   but never under 24px tall. */
export const CHIP = `relative min-h-11 min-w-11 rounded-control px-1.5 py-0.5 text-caption font-medium text-label-secondary
  lg:min-h-6 lg:min-w-7
  transition-colors duration-fast ease-out-quad hover:text-label disabled:opacity-50`

/* The chosen one climbs a surface instead of turning blue — the device the rest of the app
   uses to say "this is active" without spending the accent. The surface is a SelectionPill,
   so it slides from the old choice to the new one. */
export const PILL = 'absolute inset-0 rounded-control bg-elevated shadow-hairline'
