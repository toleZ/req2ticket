/* Story priority uses its own scale — "Crítica" instead of "Urgente" — so it lives apart
   from epicOptions.js rather than reusing EPIC_PRIORITY_OPTIONS. */

export const STORY_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'gray' },
  { value: 'medium', label: 'Media', tone: 'blue' },
  { value: 'high', label: 'Alta', tone: 'orange' },
  { value: 'critical', label: 'Crítica', tone: 'red' },
]

/* These strings are the API's contract — the .NET enums serialize exactly like this
   (see Story.cs). Never invent one: compare against the constant below, so a typo blows
   up as `undefined` instead of silently matching nothing. */
export const STORY_DONE = 'done'

/* Sentinel for the sprint filter's "Sin sprint" option. Not a sprint id and not a status:
   it is a case of its own. Kept apart from epicOptions.js's 'backlog' epic status, which
   happens to share the string but means something else entirely. */
export const NO_SPRINT = 'backlog'

export const STORY_STATUS_OPTIONS = [
  { value: 'todo', label: 'Por hacer', tone: 'gray' },
  { value: 'inProgress', label: 'En progreso', tone: 'blue' },
  { value: 'done', label: 'Hecho', tone: 'green' },
]
