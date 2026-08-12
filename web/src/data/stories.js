/* Historias mockeadas. Todavía no hay entidad Story en el backend (el único controller
   de dominio es EpicsController), así que esto se genera en el cliente en vez de venir
   de un GET /api/epics/{id}/stories. Es determinístico por épica —no random en cada
   render— para que expandir y colapsar la fila no cambie los datos en pantalla.
   Reemplazar por un fetch real en cuanto el endpoint de historias exista. */

import { STORY_PRIORITY_OPTIONS } from '@/lib/storyOptions'

const TITLE_POOL = [
  'Definir criterios de aceptación',
  'Diseñar el flujo principal',
  'Implementar el caso feliz',
  'Cubrir validaciones de formulario',
  'Agregar estados de carga y error',
  'Escribir casos límite',
  'Conectar con el endpoint real',
  'Ajustar el layout responsive',
]

const POINTS_POOL = [1, 2, 3, 5, 8]
const PRIORITY_VALUES = STORY_PRIORITY_OPTIONS.map((option) => option.value)

function pick(pool, seed) {
  return pool[seed % pool.length]
}

export function getMockStories(epic, users) {
  const count = 2 + (epic.id % 3) // 2 a 4 historias por épica

  return Array.from({ length: count }, (_, index) => {
    const seed = epic.id * 7 + index
    const criteriaTotal = 2 + (seed % 4)
    const criteriaDone = seed % (criteriaTotal + 1)
    const assignee = users.length > 0 ? users[seed % users.length] : null

    return {
      id: `${epic.id}-story-${index}`,
      code: `HU-${epic.id}-${index + 1}`,
      title: pick(TITLE_POOL, seed),
      priority: pick(PRIORITY_VALUES, seed + 1),
      points: pick(POINTS_POOL, seed + 2),
      criteriaTotal,
      criteriaDone,
      done: criteriaDone === criteriaTotal,
      assigneeId: assignee?.id ?? null,
      assigneeName: assignee?.name ?? null,
    }
  })
}
