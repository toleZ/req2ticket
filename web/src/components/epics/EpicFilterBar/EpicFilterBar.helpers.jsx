import { cn } from '@/lib/cn'
import { DOT } from './EpicFilterBar.styles'

export const withDot = (options) =>
  options.map((option) => ({
    value: option.value,
    label: option.label,
    leading: <span className={cn('size-2 shrink-0 rounded-full', DOT[option.tone])} aria-hidden="true" />,
  }))
