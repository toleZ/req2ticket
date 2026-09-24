/* `min-h-11` gives every button a 44px touch target below lg; from lg up the padding alone
   sets the height, as before. */
export const BASE = `inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-control
  font-medium enabled:active:scale-[0.97] disabled:opacity-50 lg:min-h-0`

/* `md` is the modal footers and the auth forms; `sm` is the buttons that live in a page header
   or a card header, where the page's own title is the bigger thing on the row. */
export const SIZE_CLASSES = {
  md: 'px-4 py-2 text-body',
  sm: 'px-3 py-1.5 text-subheadline',
}

/* Each variant also transitions `scale`, for the press in BASE: the button gives slightly
   under the finger, the way a native control acknowledges a tap.

   Written out in full and picked from a map. Do NOT build them as `bg-${variant}`: Tailwind
   reads the code as text and that class would never reach the CSS. */
export const VARIANT_CLASSES = {
  primary: 'bg-blue text-white transition-[filter,scale] duration-fast hover:brightness-110',
  danger: 'bg-red text-white transition-[filter,scale] duration-fast hover:brightness-110',
  success: 'bg-green text-white transition-[filter,scale] duration-fast hover:brightness-110',
  ghost: `text-label-secondary transition-[color,background-color,scale] duration-fast ease-out-quad
    hover:bg-fill-tertiary hover:text-label`,
  /* `aria-pressed:` is for the toggles (the "Prioridad" sort): without it a pressed toggle
     looked exactly like an unpressed one. */
  neutral: `bg-fill-tertiary text-label transition-[color,background-color,scale] duration-fast ease-out-quad
    hover:bg-fill-secondary aria-pressed:bg-blue/12 aria-pressed:text-blue-text`,
}
