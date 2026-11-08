/* Signing out has to empty the cache too. Logging out navigates without reloading the page, so
   without this the next person to sign in on the same tab would see the previous one's projects
   for a moment. */
import { clearSession } from '@/lib/auth'
import { queryClient } from './queryClient'

export function signOut() {
  clearSession()
  queryClient.clear()
}
