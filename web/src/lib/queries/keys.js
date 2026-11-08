/* Every cache key of the app, in one place. Never write a key by hand in a component: a key
   without the project id would make one project show another's data.

   The project id always goes right after 'projects', so ['projects', 3] is "everything of
   project 3" and invalidating it refreshes all of it. My list of projects is ['projects',
   'list'] — not ['projects'], which would be the prefix of every project's data.

   Filters are NOT part of the keys: lists are filtered in the browser with `select`, so
   changing a filter never asks the server again. */
export const keys = {
  me: ['me'],
  roles: ['roles'],
  projects: ['projects', 'list'],
  project: (projectId) => ['projects', projectId],
  members: (projectId) => ['projects', projectId, 'members'],
  workflow: (projectId) => ['projects', projectId, 'workflow'],
  epics: (projectId) => ['projects', projectId, 'epics'],
  epic: (projectId, epicId) => ['projects', projectId, 'epics', epicId],
  sprints: (projectId) => ['projects', projectId, 'sprints'],
  tickets: (projectId) => ['projects', projectId, 'tickets'],
  ticket: (projectId, ticketId) => ['projects', projectId, 'tickets', ticketId],
}
