import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createUser, deleteUser, getUsers, updateUser } from '@/lib/api/users'
import { keys } from './keys'

/* Every user of the platform, for the Administración page (SuperAdmin only). */
export function useUsers() {
  return useQuery({ queryKey: keys.users, queryFn: getUsers })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  })
}

/* mutate({ userId, values }) */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, values }) => updateUser(userId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  })
}

/* Deleting someone also takes them out of every project: the projects' member counts change. */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.users })
      queryClient.invalidateQueries({ queryKey: keys.projects })
    },
  })
}
