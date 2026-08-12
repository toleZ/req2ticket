/* La prioridad de historia no existe en el backend (no hay entidad Story todavía) y usa
   una escala propia — Crítica en vez de Urgente — así que vive separada de
   epicOptions.js en lugar de reutilizar PRIORITY_OPTIONS. */

export const STORY_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', tone: 'gray' },
  { value: 'medium', label: 'Media', tone: 'blue' },
  { value: 'high', label: 'Alta', tone: 'orange' },
  { value: 'critical', label: 'Crítica', tone: 'red' },
]
