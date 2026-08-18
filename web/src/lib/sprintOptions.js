/* Mismo patrón que epicOptions.js: opciones compartidas entre el form de creación
   (<select>) y las cards (badges), para que label y tono nunca diverjan. El prefijo
   SPRINT_ evita chocar con el STATUS_OPTIONS de epicOptions.js, que tiene otros valores. */

export const SPRINT_STATUS_OPTIONS = [
  { value: 'planned', label: 'Planificado', tone: 'purple' },
  { value: 'active', label: 'Activo', tone: 'blue' },
  { value: 'completed', label: 'Completado', tone: 'green' },
]
