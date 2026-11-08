import { useId } from 'react'

import { cn } from '@/lib/cn'
import { ROLE_OPTIONS } from '@/lib/options'
import { COUNT, DOT, GROUP, OPTION } from './RoleFilterBar.styles'

/**
 * One role at a time, or all of them: "Todos" and then a pill per role that has someone in
 * it, each with its head count. A role nobody holds is not offered — filtering by it could
 * only ever show an empty list.
 *
 * Native radios underneath, so Tab lands on the group once and the arrows move the choice.
 * `value` is '' for "Todos".
 */
export function RoleFilterBar({ members, value, onChange }) {
  const name = useId()

  const options = [
    { value: '', label: 'Todos', dotClass: 'bg-label-secondary', count: members.length },
    /* Highest role first, the order the table below reads in. ROLE_OPTIONS runs the other way. */
    ...ROLE_OPTIONS.map((role) => ({
      ...role,
      count: members.filter((member) => member.role === role.value).length,
    }))
      .filter((role) => role.count > 0)
      .reverse(),
  ]

  return (
    <fieldset className={GROUP}>
      <legend className="sr-only">Filtrar por rol</legend>
      {options.map((option) => (
        <label key={option.value || 'all'} className={OPTION}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className={cn(DOT, option.dotClass)} aria-hidden="true" />
          {option.label}
          <span className={COUNT}>{option.count}</span>
        </label>
      ))}
    </fieldset>
  )
}
