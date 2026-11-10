/* What each kind of change makes stale, in one place (DATA-1). Every mutation calls one of these
   instead of listing keys by hand, so none is forgotten.

   The lists never refresh on their own (staleTime: Infinity, see queryClient.js): they refresh
   here, after a change, and only the ones whose data or counts that change touched. The counts
   come from the API, so this is the map of what each one depends on:

     epics    ticketCount, openTicketsCount, doneTicketsCount  ← a ticket's epicId and status
     sprints  ticketCount, openTicketCount, committedPoints     ← a ticket's sprintId, status, points
     members  assignedTickets, ownedEpics                       ← a ticket's assigneeId, an epic's ownerId
     tickets  openChildrenCount of the parent                   ← any ticket change (the list always refreshes)

   Invalidating a key refetches it only if some screen is showing it; otherwise it just marks it
   to refetch the next time it is shown. */
import { readSession } from '@/lib/auth'
import { keys } from './keys'

/* `exact: true` refreshes the list and nothing under it. Without it, ['projects', 3, 'tickets']
   would also match every ticket detail, ['projects', 3, 'tickets', 5], and refetch the detail
   that the save just wrote into the cache. */
function refreshList(queryClient, queryKey) {
  queryClient.invalidateQueries({ queryKey, exact: true })
}

/* A ticket's points live in its type object in the detail, and at the top in the list. */
function pointsOf(ticket) {
  return ticket.points ?? ticket.userStory?.points ?? ticket.task?.points ?? null
}

/* A ticket appeared or disappeared (created, deleted with its children): every count that
   includes it changes. `parentId` is the parent's detail, which lists its children. */
export function invalidateAfterTicketCreatedOrDeleted(queryClient, projectId, parentId) {
  refreshList(queryClient, keys.tickets(projectId))
  refreshList(queryClient, keys.epics(projectId))
  refreshList(queryClient, keys.sprints(projectId))
  refreshList(queryClient, keys.members(projectId))
  if (parentId) queryClient.invalidateQueries({ queryKey: keys.ticket(projectId, parentId) })
}

/* A ticket was edited. `before` is the ticket as it was (from the cache) and `after` what the API
   answered; only the counts whose fields changed are refreshed. Without `before`, all of them. */
export function invalidateAfterTicketUpdate(queryClient, projectId, before, after) {
  const changed = (field) => !before || before[field] !== after[field]

  refreshList(queryClient, keys.tickets(projectId))
  if (changed('epicId') || changed('status')) refreshList(queryClient, keys.epics(projectId))
  if (changed('sprintId') || changed('status') || !before || pointsOf(before) !== pointsOf(after)) {
    refreshList(queryClient, keys.sprints(projectId))
  }
  if (changed('assigneeId')) refreshList(queryClient, keys.members(projectId))
}

/* Only the status changed (the board, the status select): epic and sprint counts. */
export function invalidateAfterStatusChange(queryClient, projectId) {
  refreshList(queryClient, keys.tickets(projectId))
  refreshList(queryClient, keys.epics(projectId))
  refreshList(queryClient, keys.sprints(projectId))
}

/* An epic was created or edited: its row, and the owner's count if the owner changed. Renaming
   or recolouring an epic touches nothing else: the ticket list only holds its id. */
export function invalidateAfterEpicSave(queryClient, projectId, before, after) {
  refreshList(queryClient, keys.epics(projectId))
  if (!before || before.ownerId !== after.ownerId) refreshList(queryClient, keys.members(projectId))
}

/* Deleting an epic leaves its tickets without one: their epicId changes, and so does every
   count a ticket change touches. */
export function invalidateAfterEpicDelete(queryClient, projectId) {
  invalidateAfterTicketCreatedOrDeleted(queryClient, projectId)
}

/* A sprint was created, edited or started: no ticket moves. */
export function invalidateAfterSprintSave(queryClient, projectId) {
  refreshList(queryClient, keys.sprints(projectId))
}

/* Completing or deleting a sprint moves its tickets (to the backlog or another sprint). */
export function invalidateAfterSprintTicketsMoved(queryClient, projectId) {
  refreshList(queryClient, keys.sprints(projectId))
  refreshList(queryClient, keys.tickets(projectId))
}

/* My own role or membership changed: my permissions in the project and my list of projects. */
function refreshIfMe(queryClient, projectId, userId) {
  if (userId !== readSession()?.user?.id) return
  refreshList(queryClient, keys.project(projectId))
  refreshList(queryClient, keys.projects)
}

/* A member was added or their role changed: only the team (and my permissions, if it was me). */
export function invalidateAfterMemberSave(queryClient, projectId, userId) {
  refreshList(queryClient, keys.members(projectId))
  refreshIfMe(queryClient, projectId, userId)
}

/* Removing a member unassigns their tickets and leaves their epics without an owner. */
export function invalidateAfterMemberRemove(queryClient, projectId, userId) {
  refreshList(queryClient, keys.members(projectId))
  refreshList(queryClient, keys.tickets(projectId))
  refreshList(queryClient, keys.epics(projectId))
  refreshIfMe(queryClient, projectId, userId)
}

/* The project's name, archived state or permissions changed. Its detail is written by the
   mutation itself (setQueryData): only my list of projects needs the new name. */
export function invalidateAfterProjectChange(queryClient) {
  refreshList(queryClient, keys.projects)
}
