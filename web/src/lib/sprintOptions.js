/* Same pattern as epicOptions.js: options shared between the create form (as <select>
   options) and the cards (as badges), so label and tone never drift apart. The SPRINT_
   prefix keeps these from colliding with the epic status options, which use different
   values. */

/* These strings are the API's contract — the .NET enums serialize exactly like this
   (see Sprint.cs). Never invent one: compare against the constants below, so a typo blows
   up as `undefined` instead of silently matching nothing. */
export const SPRINT_ACTIVE = 'active'
export const SPRINT_COMPLETED = 'completed'

export const SPRINT_STATUS_OPTIONS = [
  { value: 'planned', label: 'Planificado', tone: 'purple' },
  { value: 'active', label: 'Activo', tone: 'blue' },
  { value: 'completed', label: 'Completado', tone: 'green' },
]
