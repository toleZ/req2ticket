/* La prioridad de historia usa una escala propia — Crítica en vez de Urgente — así que
   vive separada de epicOptions.js en lugar de reutilizar PRIORITY_OPTIONS. */

export const STORY_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'gray' },
  { value: 'medium', label: 'Media', tone: 'blue' },
  { value: 'high', label: 'Alta', tone: 'orange' },
  { value: 'critical', label: 'Crítica', tone: 'red' },
]

export const STORY_STATUS_OPTIONS = [
  { value: 'todo', label: 'Por hacer', tone: 'gray' },
  { value: 'inProgress', label: 'En progreso', tone: 'blue' },
  { value: 'done', label: 'Hecho', tone: 'green' },
]
