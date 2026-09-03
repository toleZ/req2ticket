export const ICON_WRAP =
  'pointer-events-none absolute inset-y-0 left-3 flex items-center text-label-tertiary'

export const LABEL = 'mb-1 block text-subheadline font-medium text-label'

export const OPTIONAL = 'font-normal text-label-tertiary'

export const FIELD_ERROR = 'mt-1 text-footnote text-red'

/* No horizontal padding in the base on purpose. Each variant sets its own, because a base
   `px-3` plus a variant `pl-9` would put both classes in the DOM and the CSS order — not the
   order we wrote them in — would pick the winner. Composing them here instead of through `cn`
   keeps that decision visible. */
export const CONTROL_BASE = `w-full rounded-control border border-separator bg-fill-tertiary py-2
  text-body text-label transition-colors duration-fast placeholder:text-label-tertiary
  hover:border-separator-opaque disabled:opacity-50`

export const CONTROL = `${CONTROL_BASE} px-3`

/* The icon sits inside the input; `pl-9` makes room for it. */
export const CONTROL_ICON = `${CONTROL_BASE} pl-9 pr-3`

export const CONTROL_TEXTAREA = `${CONTROL} resize-none`

/* `pl-9` for the padlock on the left, `pr-10` for the eye on the right. Both are written onto
   CONTROL_BASE, which carries no horizontal padding of its own — see the comment above. This
   is the one field whose right-hand padding differs from every other, and building it as
   `${CONTROL} pr-10` would leave pr-3 and pr-10 both in the DOM. */
export const CONTROL_PASSWORD = `${CONTROL_BASE} pl-9 pr-10`

export const TOGGLE = 'absolute inset-y-0 right-0 flex items-center px-3 text-label-secondary'
