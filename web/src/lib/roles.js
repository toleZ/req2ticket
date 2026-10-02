/* Who may manage whom, mirrored from the backend so the screen only offers what the API will
   accept. The API stays the real guard: this file only decides which buttons to draw.

   The rule lives in UserService.cs (CanActOn) and the door in Program.cs (CanManageUsers):

   - Only admin and superAdmin manage people at all.
   - You may act on a role strictly below yours. An admin cannot touch another admin.
   - superAdmin is the exception: it may act on anyone, other superAdmins included, because
     nobody above it exists to remove one.
   - Nobody changes their own role or deletes themselves. */
import { ROLE_OPTIONS, rankOf } from '@/lib/options'

const MANAGER_ROLES = ['admin', 'superAdmin']

export function canManageUsers(role) {
  return MANAGER_ROLES.includes(role)
}

export function canActOn(actorRole, targetRole) {
  if (actorRole === 'superAdmin') return true
  return rankOf(ROLE_OPTIONS, targetRole) < rankOf(ROLE_OPTIONS, actorRole)
}

/* The roles worth showing in the picker: everything up to the actor's own. The ones it cannot
   hand out stay visible but disabled, so an admin sees that Admin exists and why it is shut;
   the ones above it are not shown at all. */
export function visibleRoles(actorRole) {
  const actorRank = rankOf(ROLE_OPTIONS, actorRole)
  return ROLE_OPTIONS.filter((_, index) => index <= actorRank)
}

/* Highest role first, then by name: the order the Equipo list reads in. */
export function compareMembers(a, b) {
  const byRole = rankOf(ROLE_OPTIONS, b.role) - rankOf(ROLE_OPTIONS, a.role)
  if (byRole !== 0) return byRole
  return a.name.localeCompare(b.name, 'es')
}
