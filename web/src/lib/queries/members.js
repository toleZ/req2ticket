import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { addMember, changeMemberRole, getMembers, leaveProject, removeMember } from '@/lib/api/members'
import { invalidateAfterMemberRemove, invalidateAfterMemberSave } from './invalidate'
import { keys } from './keys'

/* The team of the project. Each member also gets `id` (the same as userId), so the pieces that
   pick a person — the assignee select, the owner select, the avatars — can treat a member like
   any user. */
export function useMembers(projectId) {
  return useQuery({
    queryKey: keys.members(projectId),
    queryFn: () => getMembers(projectId),
    enabled: Boolean(projectId),
    select: (members) => members.map((member) => ({ ...member, id: member.userId })),
  })
}

export function useAddMember(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values) => addMember(projectId, values),
    onSuccess: () => invalidateAfterMemberSave(queryClient, projectId),
  })
}

export function useChangeMemberRole(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }) => changeMemberRole(projectId, userId, role),
    onSuccess: (_, { userId }) => invalidateAfterMemberSave(queryClient, projectId, userId),
  })
}

/* Leaving the project. On success my list of projects is fetched again BEFORE the caller moves
   on (the await on invalidateQueries waits for it), so "/" picks a project I am still in, and
   everything cached of the one I left is dropped. */
export function useLeaveProject(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => leaveProject(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.projects, exact: true })
      queryClient.removeQueries({ queryKey: keys.project(projectId) })
    },
  })
}

export function useRemoveMember(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId) => removeMember(projectId, userId),
    onSuccess: (_, userId) => invalidateAfterMemberRemove(queryClient, projectId, userId),
  })
}
