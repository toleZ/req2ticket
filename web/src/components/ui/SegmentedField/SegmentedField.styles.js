export const GROUP = 'flex rounded-control bg-fill-tertiary p-1'

export const INNER_RADIUS = 'rounded-control-inner'

export const OPTION = `relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 ${INNER_RADIUS}
  px-2.5 text-footnote font-medium text-label-secondary transition-colors duration-fast ease-out-quad
  hover:text-label peer-checked:text-label
  peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue/55
  peer-disabled:cursor-default peer-disabled:opacity-50 lg:min-h-8`
