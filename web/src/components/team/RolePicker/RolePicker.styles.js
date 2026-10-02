export const LIST = 'flex flex-col gap-1.5'

/* The checked card takes the blue tint and ring every "on" state uses. A disabled one fades and
   stops reacting to the pointer; `has-disabled:` reads the radio inside, which is what the
   fieldset or the role rule actually switched off. */
export const OPTION = `flex min-h-11 cursor-pointer items-center gap-3 rounded-control bg-fill-tertiary px-3 py-2
  ring-[0.5px] ring-separator ring-inset transition-[background-color,box-shadow] duration-fast ease-out-quad
  hover:bg-fill-secondary has-checked:bg-blue/12 has-checked:ring-1 has-checked:ring-blue
  has-disabled:cursor-default has-disabled:opacity-50 has-disabled:hover:bg-fill-tertiary`

export const DOT = 'size-2 shrink-0 rounded-full'

export const OPTION_LABEL = 'block text-subheadline font-medium text-label'

export const DESCRIPTION = 'block text-footnote text-label-secondary'

export const HINT = 'mt-2 text-footnote text-label-secondary'
