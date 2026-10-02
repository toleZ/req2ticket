import { MemberRow } from '@/components/team/MemberRow/MemberRow'
import { ACTIONS_COL, HEAD, HEAD_CELL, ROLE_COL, TABLE, WRAP } from './MemberList.styles'

/**
 * The team as a table: who, with which role, and — for whoever manages people — what can be
 * done to each one. A real <table>, so a screen reader can say "Rol" when it reaches a badge.
 *
 * `me` is the signed-in user as the list knows it (fresh from the API, not the login's copy).
 * `canManage` decides whether the actions column exists at all: a read-only viewer gets a
 * two-column table, not a column of padlocks.
 */
export function MemberList({ members, me, canManage, onEdit, onDelete }) {
  return (
    <div className={WRAP}>
      <table className={TABLE}>
        <thead className={HEAD}>
          <tr>
            <th scope="col" className={HEAD_CELL}>
              Integrante
            </th>
            <th scope="col" className={`${HEAD_CELL} ${ROLE_COL}`}>
              Rol
            </th>
            {canManage && (
              <th scope="col" className={ACTIONS_COL}>
                <span className="sr-only">Acciones</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              me={me}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
