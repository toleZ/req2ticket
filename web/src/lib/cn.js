import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/* clsx resolves conditionals and falsy values; twMerge resolves conflicting Tailwind
   classes so the last one wins, instead of both landing in the DOM. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
