import { useId } from 'react'
import { Lock } from 'lucide-react'

import { LABEL } from '@/components/ui/Field/Field.styles'
import { cn } from '@/lib/cn'
import { canActOn, visibleRoles } from '@/lib/roles'
import { DESCRIPTION, DOT, HINT, LIST, OPTION, OPTION_LABEL } from './RolePicker.styles'

/**
 * The role, as a list of cards rather than a <select>: what a role may do is the whole reason
 * to pick one over another, and a dropdown has no room to say it.
 *
 * Shows the roles up to the actor's own (lib/roles.js). Those it cannot hand out stay in the
 * list, disabled and with a padlock, and the hint underneath says why. `lockedReason` shuts the
 * whole group with its own explanation — editing yourself, whose role the API never lets you
 * change.
 */
export function RolePicker({ value, actorRole, disabled = false, lockedReason, onChange }) {
  const name = useId()
  const hintId = useId()
  const roles = visibleRoles(actorRole)
  const someBlocked = roles.some((role) => !canActOn(actorRole, role.value))
  const hint = lockedReason ?? (someBlocked ? 'Solo podés asignar roles por debajo del tuyo.' : null)

  return (
    <fieldset disabled={disabled || Boolean(lockedReason)} aria-describedby={hint ? hintId : undefined}>
      <legend className={LABEL}>Rol</legend>
      <div className={LIST}>
        {roles.map((role) => {
          const blocked = !canActOn(actorRole, role.value)
          return (
            <label key={role.value} className={OPTION}>
              <input
                type="radio"
                name={name}
                value={role.value}
                checked={value === role.value}
                disabled={blocked}
                onChange={() => onChange(role.value)}
                className="size-4 shrink-0 accent-blue"
              />
              <span className={cn(DOT, role.dotClass)} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className={OPTION_LABEL}>{role.label}</span>
                <span className={DESCRIPTION}>{role.description}</span>
              </span>
              {blocked && <Lock className="size-3.5 shrink-0 text-label-tertiary" aria-hidden="true" />}
            </label>
          )
        })}
      </div>
      {hint && (
        <p id={hintId} className={HINT}>
          {hint}
        </p>
      )}
    </fieldset>
  )
}
