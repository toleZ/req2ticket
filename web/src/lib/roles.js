/* Ordering the Equipo list. Who may manage members is NOT decided here: that is the
   `members.manage` permission, read with can() (see hooks/useCurrentProject.js). */
import { ROLE_OPTIONS, rankOf } from '@/lib/options'

/* Highest role first, then by name: the order the Equipo list reads in. */
export function compareMembers(a, b) {
  const byRole = rankOf(ROLE_OPTIONS, b.role) - rankOf(ROLE_OPTIONS, a.role)
  if (byRole !== 0) return byRole
  return a.name.localeCompare(b.name, 'es')
}

/* Why the last Admin's controls are off: removing, demoting or leaving. */
export const LAST_ADMIN_REASON = 'Tiene que quedar al menos un Admin'

/* How many Admins the project has: the last one can be neither removed nor demoted, nor leave. */
export function countAdmins(members) {
  return members.filter((member) => member.role === 'admin').length
}
