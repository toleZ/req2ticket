import { MemberRow } from '@/components/team/MemberRow/MemberRow'
import { ACTIONS_COL, HEAD, HEAD_CELL, ROLE_COL, TABLE, WRAP } from './MemberList.styles'

/**
 * The team as a table: who, with which role, and — for whoever may manage it — the remove
 * button. A real <table>, so a screen reader can say "Rol" when it reaches a badge.
 *
 * `canManage` decides whether the actions column exists at all. `adminCount` is how many Admins
 * the whole project has (not just the filtered rows): the last one is locked.
 */
export function MemberList({ members, meId, adminCount, canManage, savingId, onChangeRole, onRemove }) {
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
              isMe={member.id === meId}
              isLastAdmin={member.role === 'admin' && adminCount <= 1}
              canManage={canManage}
              isSaving={savingId === member.id}
              onChangeRole={onChangeRole}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
