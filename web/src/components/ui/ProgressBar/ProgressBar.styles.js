export const SIZE_CLASSES = {
  sm: 'h-1',
  md: 'h-1.5',
}

export const TRACK = 'w-full overflow-hidden rounded-full bg-fill-tertiary'

/* Width, not scaleX, on purpose: scaling would squash the rounded end at low values, and the
   track is fixed and overflow-hidden, so this width change reflows nothing else. */
export const FILL = 'h-full rounded-full transition-[width] duration-base ease-out-quad'

/* Blue is progress still under way; green is used where the bar counts finished work, so it
   matches the "Hecho" status it is measuring. */
export const TONE_CLASSES = {
  blue: 'bg-blue',
  green: 'bg-green',
}
