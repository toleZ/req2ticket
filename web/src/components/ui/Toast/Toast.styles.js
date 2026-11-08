/* Bottom centre on a phone, bottom right from lg up. The bottom offset adds the safe area so
   the toast never sits under the home indicator. */
export const REGION = `pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-60
  flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:right-6 lg:items-end lg:px-0`

export const TOAST = `pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card bg-material-thick
  py-3 pr-2 pl-3.5 shadow-popover ring-[0.5px] ring-separator backdrop-blur-xl backdrop-saturate-150`

export const MESSAGE = 'min-w-0 flex-1 pt-px text-subheadline text-label'

export const ACTION = `shrink-0 rounded-control-inner px-2 py-1 text-subheadline font-semibold text-blue-text
  transition-colors duration-fast hover:bg-blue/12`

export const CLOSE = `-my-0.5 grid size-7 shrink-0 place-items-center rounded-full text-label-tertiary
  transition-colors duration-fast hover:bg-fill-tertiary hover:text-label`

/* Written out in full: Tailwind reads the code as text, so `text-${tone}` would never exist. */
export const ICON_CLASSES = {
  success: 'text-green',
  error: 'text-red',
  info: 'text-blue',
}
