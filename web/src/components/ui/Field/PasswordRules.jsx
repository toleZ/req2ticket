import { Check } from 'lucide-react'

import { cn } from '@/lib/cn'
import { PASSWORD_RULES } from './PasswordRules.data'

/**
 * The checklist under a new password: each rule ticks itself as you type. PasswordField draws
 * it when you pass `showRules`; you should not need it on its own.
 */
export function PasswordRules({ id, value }) {
  return (
    <ul id={id} className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value)
        return (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2 text-footnote transition-colors duration-fast',
              met ? 'text-label' : 'text-label-secondary',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'grid size-3.5 shrink-0 place-items-center rounded-full border transition-colors duration-fast',
                met ? 'border-green bg-green text-white' : 'border-separator-opaque',
              )}
            >
              {met && <Check className="size-2.5 animate-tick-in" strokeWidth={4} />}
            </span>
            {rule.label}
            <span className="sr-only">{met ? ': cumplida' : ': pendiente'}</span>
          </li>
        )
      })}
    </ul>
  )
}
