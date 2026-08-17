/* Mismo patrón que epicOptions.js: opciones compartidas entre el form de creación
   (<select>) y las cards (badges), para que label y tono nunca diverjan. */

export { findOption } from '@/lib/epicOptions'

export const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planificado', tone: 'purple' },
  { value: 'active', label: 'Activo', tone: 'blue' },
  { value: 'completed', label: 'Completado', tone: 'green' },
]
