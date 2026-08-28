import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon'
import { Badge } from '@/components/ui/Badge'
import { findOption } from '@/lib/options'
import { TICKET_STATUS_OPTIONS } from '@/lib/ticketOptions'

/* Mismo criterio que TicketRow: nada de fondo en el hover. Acá además la fila llega hasta el
   borde derecho del panel, así que la banda gris cruzaba todo el ancho para señalar algo que
   se lee a la izquierda. */
const ROW = 'group flex w-full items-center gap-2 text-left'

const CODE = `shrink-0 text-caption text-label-tertiary transition-colors duration-fast
  ease-out-quad group-hover:text-label-secondary`

const TITLE = `min-w-0 flex-1 truncate text-footnote text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

/**
 * Listado compacto de lo que contiene un sprint o una épica.
 *
 * Cada fila abre el ticket: `onSelectTicket` llega desde la página, que es la que tiene el
 * modal. Este componente se usa en tres lugares (la épica desplegada, la tarjeta de un sprint
 * y el bloque Backlog), así que engancharlo acá los deja clickeables a los tres de una.
 *
 * Las filas no llevan padding propio: el hover no pinta nada, así que no hay ninguna caja que
 * necesite aire por dentro y el texto queda alineado con el resto del panel.
 */
export function TicketSummaryList({ tickets, onSelectTicket }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {tickets.map((ticket) => {
        const status = findOption(TICKET_STATUS_OPTIONS, ticket.status)

        return (
          <li key={ticket.id}>
            {/* Igual que en TicketRow: para ARIA lo de adentro de un <button> es decorativo,
                así que el nombre accesible tiene que estar acá. */}
            <button
              type="button"
              onClick={() => onSelectTicket(ticket)}
              aria-label={`Abrir ${ticket.code}: ${ticket.title}`}
              className={ROW}
            >
              <TicketTypeIcon type={ticket.type} className="size-3.5" />
              <span className={CODE}>{ticket.code}</span>
              <span className={TITLE}>{ticket.title}</span>
              {status && <Badge tone={status.tone}>{status.label}</Badge>}
              <span className="shrink-0 text-caption font-medium text-label-secondary">
                {ticket.points} pts
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
