import { Lock, Pencil, Trash2 } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { findOption, ROLE_OPTIONS } from '@/lib/options'
import { canActOn } from '@/lib/roles'
import { ACTIONS, CELL, EMAIL, LOCK, NAME, ROLE_CELL, ROW } from './MemberRow.styles'

/**
 * One person. The actions follow the same rule the API enforces (lib/roles.js): edit and
 * delete when you outrank them, a padlock when you do not. You never get a delete on your own
 * row — the API refuses it — but a superAdmin can still edit their own name and email.
 */
export function MemberRow({ member, me, canManage, onEdit, onDelete }) {
  const role = findOption(ROLE_OPTIONS, member.role)
  const isMe = member.id === me?.id
  const canEdit = canManage && canActOn(me.role, member.role)
  const canDelete = canEdit && !isMe

  const badge = <Badge tone={role?.tone}>{role?.label ?? member.role}</Badge>

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
            <div className="mt-1.5 sm:hidden">{badge}</div>
          </div>
        </div>
      </td>

      <td className={ROLE_CELL}>{badge}</td>

      {canManage && (
        <td className={CELL}>
          <div className={ACTIONS}>
            {canEdit && (
              <IconButton label={`Editar a ${member.name}`} title="Editar" onClick={() => onEdit(member)}>
                <Pencil className="size-4" aria-hidden="true" />
              </IconButton>
            )}
            {canDelete && (
              <IconButton
                label={`Quitar a ${member.name} del equipo`}
                title="Quitar del equipo"
                variant="danger"
                onClick={() => onDelete(member)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </IconButton>
            )}
            {!canEdit && (
              <span className={LOCK} role="img" aria-label={`Tu rol no puede editar a ${role?.label}`} title={`Tu rol no puede editar a ${role?.label}`}>
                <Lock className="size-3.5" aria-hidden="true" />
              </span>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}
