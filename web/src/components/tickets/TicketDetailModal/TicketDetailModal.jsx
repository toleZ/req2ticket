import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Badge } from '@/components/ui/Badge/Badge'
import { DetailHeader } from '@/components/ui/DetailHeader/DetailHeader'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTicket } from '@/lib/queries/tickets'
import { statusOf } from './TicketDetailModal.helpers'
import { TicketSheet } from './TicketSheet'

/**
 * A ticket's sheet: everything it holds, and the place it is edited from.
 *
 *     <TicketDetailModal projectId={projectId} ticketId={id} canWrite canDelete onClose={close} />
 *
 * Self-contained: it asks for the ticket's detail itself (useTicket), so it opens at once with
 * what the list already had — code, title, status — and fills in the rest when it arrives.
 * The page mounts it while a ticket is open and unmounts it on close; wrap it in an
 * <AnimatePresence> so it closes the way it opened.
 *
 * Status saves on its own, through the workflow (ENT-3). Everything else is a form with a Save
 * button: what you type is a draft until "Guardar cambios", and the sheet closes only if it
 * saved. A tick in a list saves right away.
 *
 * `onCreateChild({ type, parentId, epicId, sprintId })`, optional: the shortcuts "Agregar
 * tarea" and "Reportar bug" in a story, "Crear fix" in a bug. The page closes this sheet and
 * opens the create sheet with those defaults.
 *
 * This file only loads the ticket. The editable sheet is TicketSheet, next to it.
 */
export function TicketDetailModal({ projectId, ticketId, canWrite = false, canDelete = false, onClose, onCreateChild }) {
  const { data: ticket, isPlaceholderData, isError, refetch } = useTicket(projectId, ticketId)

  /* The ticket was deleted from somewhere else, or the id is not in this project. */
  if (!ticket && isError) {
    return (
      <Modal isOpen onClose={onClose} title="Ticket">
        <LoadState state="error" errorText="No se pudo abrir el ticket." onRetry={refetch} />
      </Modal>
    )
  }

  /* While the detail travels, the row from the list stands in: the header already reads right,
     and the form waits — building it from the list would start without description or lists. */
  if (!ticket || isPlaceholderData) {
    const status = ticket && statusOf(ticket.status)
    return (
      <Modal isOpen onClose={onClose} size="lg">
        {ticket && (
          <DetailHeader
            leading={<TicketTypeIcon type={ticket.type} className="size-4.5" />}
            code={ticket.code}
            badge={status && <Badge tone={status.tone}>{status.label}</Badge>}
            onClose={onClose}
          />
        )}
        <div className="px-5 py-4">
          {ticket && <h2 className="text-title2 text-label">{ticket.title}</h2>}
          <LoadState state="loading" loadingText="Cargando el detalle…" />
        </div>
      </Modal>
    )
  }

  return (
    <TicketSheet
      key={ticket.id}
      projectId={projectId}
      ticket={ticket}
      canWrite={canWrite}
      canDelete={canDelete}
      onClose={onClose}
      onCreateChild={onCreateChild}
    />
  )
}
