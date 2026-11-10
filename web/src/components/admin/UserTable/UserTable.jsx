import { Pencil, Trash2 } from 'lucide-react'

import { ACTIONS_COL, HEAD, HEAD_CELL, ROLE_COL, TABLE, WRAP } from '@/components/team/MemberList/MemberList.styles'
import { ACTIONS, CELL, EMAIL, NAME, ROLE_CELL, ROW } from '@/components/team/MemberRow/MemberRow.styles'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { findOption, PLATFORM_ROLE_OPTIONS } from '@/lib/options'

/**
 * Every user of the platform, with the same look as the Equipo table: who, their platform role,
 * and edit / delete. Deleting yourself is locked (the API refuses it too); deleting the last
 * SuperAdmin or the only Admin of a project is refused by the API, and the confirmation says why.
 */
export function UserTable({ users, meId, onEdit, onDelete }) {
  return (
    <div className={WRAP}>
      <table className={TABLE}>
        <thead className={HEAD}>
          <tr>
            <th scope="col" className={HEAD_CELL}>
              Usuario
            </th>
            <th scope="col" className={`${HEAD_CELL} ${ROLE_COL}`}>
              Rol
            </th>
            <th scope="col" className={ACTIONS_COL}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const role = findOption(PLATFORM_ROLE_OPTIONS, user.platformRole)
            const isMe = user.id === meId
            return (
              <tr key={user.id} className={ROW}>
                <td className={CELL}>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={user.name} size="md" colorKey={user.id} />
                    <div className="min-w-0">
                      <p className="flex min-w-0 items-center gap-2">
                        <span className={NAME}>{user.name}</span>
                        {isMe && <Badge>Vos</Badge>}
                      </p>
                      <p className={EMAIL}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className={ROLE_CELL}>{role && <Badge tone={role.tone}>{role.label}</Badge>}</td>
                <td className={CELL}>
                  <div className={ACTIONS}>
                    <IconButton label={`Editar a ${user.name}`} title="Editar" onClick={() => onEdit(user)}>
                      <Pencil className="size-4" aria-hidden="true" />
                    </IconButton>
                    {isMe ? (
                      <Tooltip label="No podés borrar tu propia cuenta" wrapsDisabled align="end">
                        <IconButton label={`Borrar a ${user.name}`} variant="danger" disabled>
                          <Trash2 className="size-4" aria-hidden="true" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <IconButton label={`Borrar a ${user.name}`} title="Borrar" variant="danger" onClick={() => onDelete(user)}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </IconButton>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
