import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { findOption } from '@/lib/options'
import { springSoft } from '@/lib/motion'
import { summarizeTickets } from '@/lib/ticketStats'

const TOGGLE_BUTTON = `mt-0.5 grid size-6 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast ease-out-quad hover:bg-fill-secondary
  hover:text-label`

/* El área clickeable es sólo el código y el nombre, no la fila entera. A propósito: al lado
   está el chevron y abajo, cuando se despliega, está la lista de tickets, que también son
   botones. Si el clic viviera en el <li>, cada uno de esos necesitaría su e.stopPropagation()
   y olvidarse de uno se ve como "abrir un ticket también abre la épica".

   El hover NO pinta fondo. Pintarlo dejaba un bloque gris que envolvía media fila —badges de
   colores incluidos— y se leía como un parche, no como algo clickeable. Lo que se anuncia es
   lo mismo que anuncia un enlace: el nombre se subraya y el código sube un escalón de gris. */
const OPEN_BUTTON = 'group flex min-w-0 flex-wrap items-center gap-2 text-left'

const OPEN_CODE = `text-caption text-label-tertiary transition-colors duration-fast ease-out-quad
  group-hover:text-label-secondary`

/* `decoration-label-tertiary`: el subrayado hereda el color del texto si no se le dice otra
   cosa, y una línea negra debajo de un nombre en negro pesa demasiado para un hover. */
const OPEN_NAME = `text-body font-medium text-label underline-offset-2
  group-hover:underline group-hover:decoration-label-tertiary`

/**
 * Una épica en la lista: sólo lectura, salvo el desplegable que muestra sus tickets.
 *
 * El estado y la prioridad se editaban acá adentro con dos selects; ahora eso vive en
 * EpicDetailModal, que además deja tocar el nombre, la descripción, el responsable y el color.
 */
export function EpicRow({ epic, tickets, onSelectEpic, onSelectTicket }) {
  const panelId = useId()
  const [isExpanded, setIsExpanded] = useState(false)

  const accent = findOption(ACCENT_COLORS, epic.accentColor)
  const status = findOption(EPIC_STATUS_OPTIONS, epic.status)
  const priority = findOption(EPIC_PRIORITY_OPTIONS, epic.priority)
  const stats = summarizeTickets(tickets)

  return (
    <li className="rounded-control bg-fill-tertiary px-3 py-2.5">
      <div className="flex items-start gap-2">
        {/* The row is already bg-fill-tertiary, so TOGGLE_BUTTON hovers to fill-secondary
            instead: the usual fill-tertiary hover would be invisible here. */}
        <button
          type="button"
          aria-label={isExpanded ? 'Ocultar tickets' : 'Ver tickets'}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          className={TOGGLE_BUTTON}
        >
          <ChevronRight
            className={cn('size-4 transition-transform duration-fast ease-out-quad', isExpanded && 'rotate-90')}
            aria-hidden="true"
          />
        </button>

        {accent && (
          <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', accent.dotClass)} aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onSelectEpic(epic)}
            aria-label={`Abrir ${epic.code}: ${epic.name}`}
            className={OPEN_BUTTON}
          >
            <span className={OPEN_CODE}>{epic.code}</span>
            {/* Un <h3> adentro de un <button> es HTML válido y mantiene el índice de
                encabezados de la página, que es como se navega una lista larga con lector. */}
            <h3 className={OPEN_NAME}>{epic.name}</h3>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}
            {epic.ownerName && (
              <span className="text-footnote text-label-secondary">{epic.ownerName}</span>
            )}
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-caption text-label-tertiary">
              {stats.completed}/{stats.total} {stats.total === 1 ? 'ticket' : 'tickets'} ·{' '}
              {stats.pointsCompleted}/{stats.points} pts
            </span>
            <ProgressBar value={stats.completed} max={stats.total} size="sm" className="w-20" />
          </div>

          {epic.description && (
            <p className="mt-1 text-footnote text-label-secondary">{epic.description}</p>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSoft}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-3 border-t border-separator pt-3">
              <p className="text-footnote font-medium text-label-secondary">Tickets</p>
              {stats.total === 0 ? (
                <p className="mt-1.5 text-footnote text-label-tertiary">
                  Esta épica todavía no tiene tickets.
                </p>
              ) : (
                <div className="mt-1.5">
                  <TicketSummaryList tickets={tickets} onSelectTicket={onSelectTicket} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
