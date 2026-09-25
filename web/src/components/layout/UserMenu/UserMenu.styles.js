export const TRIGGER = `flex min-h-11 w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-control px-2
  text-left text-subheadline font-medium text-label transition-colors duration-fast ease-out-quad
  hover:bg-fill-tertiary lg:min-h-10`

/* Collapsed, the trigger is the round avatar alone: no box behind it, a ring around it on
   hover and while the menu is open, and a round focus ring. `my-1` keeps the row as tall as
   the expanded one (40px), so the collapse button above never shifts. */
export const TRIGGER_COMPACT = `group/user my-1 ml-2 grid size-8 place-items-center rounded-full focus-visible:rounded-full
  transition-[scale] duration-fast enabled:active:scale-95`

export const AVATAR_RING = `transition-shadow duration-fast group-hover/user:ring-2 group-hover/user:ring-blue/45
  group-aria-expanded/user:ring-2 group-aria-expanded/user:ring-blue/45`

export const MENU = `absolute z-30 w-56 animate-fade-in rounded-control bg-elevated p-1 shadow-popover
  ring-[0.5px] ring-separator`

export const ITEM = `flex min-h-11 w-full items-center gap-2.5 rounded-control-inner px-2.5
  text-left text-subheadline text-label transition-colors duration-fast hover:bg-fill-tertiary
  focus-visible:bg-fill-tertiary focus-visible:outline-none lg:min-h-8`

export const CHEVRON = 'size-4 shrink-0 text-label-secondary transition-[rotate] duration-fast'
