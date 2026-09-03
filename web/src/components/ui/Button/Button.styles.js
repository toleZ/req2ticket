export const BASE = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  font-medium disabled:opacity-50`

/* `md` is the modal footers and the auth forms; `sm` is the buttons that live in a page header
   or a card header, where the page's own title is the bigger thing on the row. */
export const SIZE_CLASSES = {
  md: 'px-4 py-2 text-body',
  sm: 'px-3 py-1.5 text-subheadline',
}

/* Written out in full and picked from a map. Do NOT build them as `bg-${variant}`: Tailwind
   reads the code as text and that class would never reach the CSS. */
export const VARIANT_CLASSES = {
  primary: 'bg-blue text-white transition-[filter] duration-fast hover:brightness-110',
  danger: 'bg-red text-white transition-[filter] duration-fast hover:brightness-110',
  success: 'bg-green text-white transition-[filter] duration-fast hover:brightness-110',
  ghost: `text-label-secondary transition-colors duration-fast ease-out-quad
    hover:bg-fill-tertiary hover:text-label`,
  neutral: `bg-fill-tertiary text-label transition-colors duration-fast ease-out-quad
    hover:bg-fill-secondary`,
}
