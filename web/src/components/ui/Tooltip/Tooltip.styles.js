export const WRAP = 'relative inline-flex max-w-full'

/* Around a disabled control the wrapper takes the pointer and the focus: a disabled <button>
   fires no events at all, so a tooltip listening on it would never open. */
export const WRAP_DISABLED = 'cursor-not-allowed rounded-control [&>*]:pointer-events-none'

export const BUBBLE = `pointer-events-none absolute z-50 w-max max-w-64 rounded-control-inner bg-label px-2.5 py-1.5
  text-left text-footnote font-medium text-[var(--bg-elevated)] shadow-popover transition-[opacity,translate] duration-fast
  ease-out-quad`

export const SIDE_CLASSES = {
  top: 'bottom-full mb-2',
  bottom: 'top-full mt-2',
}

export const ALIGN_CLASSES = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0',
  end: 'right-0',
}
