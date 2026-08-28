import { BookOpen, Bug, ListTodo, Wrench } from 'lucide-react'

import { cn } from '@/lib/cn'
import { findOption } from '@/lib/options'
import { TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'

/* El icono de cada tipo. Antes las filas dibujaban un FileText para los cuatro, que es tanto
   como no dibujar nada: si el icono no distingue, no informa. */
const TYPE_ICONS = {
  userStory: BookOpen,
  task: ListTodo,
  bug: Bug,
  fix: Wrench,
}

/* El tono sale de TICKET_TYPE_OPTIONS, pero la clase de color hay que escribirla entera:
   Tailwind lee el código como texto y nunca vería un `text-${tone}`. Es el mismo motivo por
   el que ACCENT_COLORS en lib/epicOptions.js guarda `dotClass` y no el nombre del color. */
const TONE_CLASSES = {
  blue: 'text-blue',
  teal: 'text-teal',
  red: 'text-red',
  green: 'text-green',
}

/**
 * El icono del tipo de un ticket, ya pintado del color que le toca.
 *
 * `aria-hidden`: al lado siempre hay un badge o un texto que dice el tipo con palabras, así
 * que anunciarlo dos veces solo molesta a quien usa lector de pantalla.
 */
export function TicketTypeIcon({ type, className }) {
  const option = findOption(TICKET_TYPE_OPTIONS, type)
  const Icon = TYPE_ICONS[type]

  // Un tipo que no conocemos (una API más nueva que este front) no rompe la fila: no dibuja.
  if (!Icon) return null

  return (
    <Icon
      aria-hidden="true"
      className={cn('shrink-0', option && TONE_CLASSES[option.tone], className)}
    />
  )
}
