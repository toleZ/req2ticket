import { Trash2 } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Select } from '@/components/ui/Select/Select'
import { toneOptions } from '@/components/ui/Select/Select.options'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { findOption, ROLE_OPTIONS } from '@/lib/options'
import { LAST_ADMIN_REASON } from '@/lib/roles'
import { ACTIONS, CELL, EMAIL, NAME, ROLE_CELL, ROW } from './MemberRow.styles'

/* Highest role first in the inline select, the order the list reads in. */
const ROLE_SELECT_OPTIONS = toneOptions([...ROLE_OPTIONS].reverse())

/**
 * One person of the team. With `canManage` the role is an inline select and there is a remove
 * button; without it, the role is a badge and there are no actions at all (AUTH-1).
 *
 * `isLastAdmin`: this is the project's only Admin. Its select and remove button stay visible but
 * disabled, with the reason in a tooltip — a business rule, not a permission.
 */
export function MemberRow({ member, isMe, isLastAdmin, canManage, isSaving, onChangeRole, onRemove }) {
  const role = findOption(ROLE_OPTIONS, member.role)
  const badge = <Badge tone={role?.tone}>{role?.label ?? member.role}</Badge>

  const roleSelect = (
    <Select
      id={`member-role-${member.id}`}
      value={member.role}
      options={ROLE_SELECT_OPTIONS}
      disabled={isLastAdmin || isSaving}
      onChange={(next) => next !== member.role && onChangeRole(member, next)}
    />
  )

  const roleControl = !canManage ? (
    badge
  ) : isLastAdmin ? (
    <Tooltip label={LAST_ADMIN_REASON} wrapsDisabled>
      {roleSelect}
    </Tooltip>
  ) : (
    roleSelect
  )

  return (
    <tr className={ROW}>
      <td className={CELL}>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={member.name} size="md" colorKey={member.id} />
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2">
              <span className={NAME}>{member.name}</span>
              {isMe && <Badge>Vos</Badge>}
            </p>
            <p className={EMAIL}>{member.email}</p>
            <div className="mt-1.5 sm:hidden">{roleControl}</div>
          </div>
        </div>
      </td>

      <td className={ROLE_CELL}>{roleControl}</td>

      {canManage && (
        <td className={CELL}>
          <div className={ACTIONS}>
            {isLastAdmin ? (
              <Tooltip label={LAST_ADMIN_REASON} wrapsDisabled align="end">
                <IconButton label={`Quitar a ${member.name} del proyecto`} variant="danger" disabled>
                  <Trash2 className="size-4" aria-hidden="true" />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton
                label={`Quitar a ${member.name} del proyecto`}
                title="Quitar del proyecto"
                variant="danger"
                disabled={isSaving}
                onClick={() => onRemove(member)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </IconButton>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}
