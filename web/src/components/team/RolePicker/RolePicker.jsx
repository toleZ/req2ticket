import { useId } from 'react'

import { LABEL } from '@/components/ui/Field/Field.styles'
import { cn } from '@/lib/cn'
import { ROLE_OPTIONS } from '@/lib/options'
import { DESCRIPTION, DOT, LIST, OPTION, OPTION_LABEL } from './RolePicker.styles'

/**
 * The role inside the project, as a list of cards rather than a dropdown: what a role allows is
 * the whole reason to pick one over another, and a dropdown has no room to say it. Every role is
 * offered — who may hand them out is the members.manage permission, checked before this opens.
 *
 * Highest role first, the order the team list reads in.
 */
export function RolePicker({ value, disabled = false, error, onChange }) {
  const name = useId()
  const roles = [...ROLE_OPTIONS].reverse()

  return (
    <fieldset disabled={disabled}>
      <legend className={LABEL}>Rol</legend>
      <div className={LIST}>
        {roles.map((role) => (
          <label key={role.value} className={OPTION}>
            <input
              type="radio"
              name={name}
              value={role.value}
              checked={value === role.value}
              onChange={() => onChange(role.value)}
              className="size-4 shrink-0 accent-blue"
            />
            <span className={cn(DOT, role.dotClass)} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className={OPTION_LABEL}>{role.label}</span>
              <span className={DESCRIPTION}>{role.description}</span>
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-footnote text-red-text">{error}</p>}
    </fieldset>
  )
}
