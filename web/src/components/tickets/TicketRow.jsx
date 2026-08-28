import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { findOption } from '@/lib/options'
import { TICKET_PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'
import { checklistProgress } from '@/lib/ticketStats'

/* Sin cambio de fondo en el hover: la fila ya es un bloque gris, y oscurecerla entera para
   decir "esto se puede abrir" tapaba los badges y quedaba como una mancha. Se anuncia igual
   que un enlace — el título se subraya y el código sube un escalón de gris. */
const ROW = 'group flex w-full items-center gap-2 rounded-control bg-fill-tertiary px-2.5 py-2 text-left'

const CODE = `shrink-0 text-caption text-label-tertiary transition-colors duration-fast
  ease-out-quad group-hover:text-label-secondary`

const TITLE = `min-w-0 flex-1 truncate text-subheadline text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

/**
 * Una fila de la lista de tickets: sólo lectura, y entera clickeable.
 *
 * Antes esta fila se abría en un acordeón con tres selects adentro. Se editaba en el medio de
 * una lista, y sólo tres de los once campos que tiene un ticket. Ahora la fila cuenta lo que
 * hay y el que edita es TicketDetailModal.
 *
 * Toda la fila es el botón, y no sólo el código y el título: una vez que se fueron el chevron
 * y el tacho no queda ningún otro control adentro, así que no hay clics que desambiguar ni
 * ningún e.stopPropagation() que escribir. Si algún día vuelve un botón acá adentro, esto
 * tiene que volver a ser un área de clic más chica.
 */
export function TicketRow({ ticket, onSelectTicket }) {
  const priority = findOption(TICKET_PRIORITY_OPTIONS, ticket.priority)
  const type = findOption(TICKET_TYPE_OPTIONS, ticket.type)
  const checklist = checklistProgress(ticket)

  return (
    <li>
      {/* El aria-label no es de más: para ARIA los hijos de un <button> son decorativos, así
          que los badges y la barra de progreso de acá adentro no se anuncian. Sin esta línea
          el lector de pantalla leería "botón" y nada más. */}
      <button
        type="button"
        onClick={() => onSelectTicket(ticket)}
        aria-label={`Abrir ${ticket.code}: ${ticket.title}`}
        className={ROW}
      >
        <TicketTypeIcon type={ticket.type} className="size-4" />

        <span className={CODE}>{ticket.code}</span>

        {type && <Badge tone={type.tone}>{type.short}</Badge>}

        <span className={TITLE}>{ticket.title}</span>

        {ticket.epicName && <Badge tone="neutral">{ticket.epicName}</Badge>}

        {ticket.sprintName && <Badge tone="purple">{ticket.sprintName}</Badge>}

        {checklist.total > 0 && (
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="text-caption text-label-tertiary">
              {checklist.done}/{checklist.total}
            </span>
            <ProgressBar value={checklist.done} max={checklist.total} size="sm" className="w-14" />
          </span>
        )}

        {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}

        <span className="shrink-0 text-caption font-medium text-label-secondary">
          {ticket.points} pts
        </span>

        <Avatar name={ticket.assigneeName} size="sm" />
      </button>
    </li>
  )
}
