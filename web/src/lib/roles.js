/* Ordering the Equipo list. Who may manage members is NOT decided here: that is the
   `members.manage` permission, read with can() (see hooks/useCurrentProject.js). */
import { ROLE_OPTIONS, rankOf } from '@/lib/options'

/* Highest role first, then by name: the order the Equipo list reads in. */
export function compareMembers(a, b) {
  const byRole = rankOf(ROLE_OPTIONS, b.role) - rankOf(ROLE_OPTIONS, a.role)
  if (byRole !== 0) return byRole
  return a.name.localeCompare(b.name, 'es')
}

/* How many Admins the project has: the last one can be neither removed nor demoted. */
export function countAdmins(members) {
  return members.filter((member) => member.role === 'admin').length
}
