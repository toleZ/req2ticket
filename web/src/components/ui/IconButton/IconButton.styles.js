/* 44px below lg, where a finger is the pointer; the compact 32px from lg up. */
export const BASE = 'grid size-11 shrink-0 place-items-center rounded-control enabled:active:scale-90 disabled:opacity-50 lg:size-8'

export const VARIANT_CLASSES = {
  neutral: `text-label-secondary transition-[color,background-color,scale] duration-fast ease-out-quad
    hover:bg-fill-tertiary hover:text-label`,
  danger: `text-label-tertiary transition-[color,background-color,scale] duration-fast ease-out-quad
    hover:bg-red/12 hover:text-red`,
}
