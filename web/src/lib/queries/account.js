import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { changePassword, getMe, getRoles, updateMe } from '@/lib/api/account'
import { updateSessionUser } from '@/lib/auth'
import { keys } from './keys'

/* Who I am: { id, name, email, platformRole }. */
export function useMe() {
  return useQuery({ queryKey: keys.me, queryFn: getMe })
}

/* The catalog of project roles and their permissions. It never changes while the app runs. */
export function useRoles() {
  return useQuery({ queryKey: keys.roles, queryFn: getRoles })
}

/* Changing my name also updates the stored session, which is where the sidebar reads it. */
export function useUpdateMe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (me) => {
      queryClient.setQueryData(keys.me, me)
      updateSessionUser(me)
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword })
}
