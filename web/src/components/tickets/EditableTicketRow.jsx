import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, FileText, Trash2 } from 'lucide-react'

import { TicketExtrasPanel } from '@/components/tickets/TicketExtrasPanel'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import { springSoft } from '@/lib/motion'
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'
import { checklistProgress } from '@/lib/ticketStats'

/* The row's selects are smaller than a form field and sit on the expanded panel, which
   is bg-elevated. Written out in full: there is no twMerge here to drop the classes this
   overrides, so every class it replaces has to be absent rather than repeated. */
const ROW_SELECT = `w-auto rounded-control border border-separator bg-elevated px-2 py-1 text-footnote
  text-label disabled:opacity-50`

const TOGGLE_BUTTON = `mt-0.5 grid size-6 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast ease-out-quad hover:bg-fill-secondary
  hover:text-label disabled:opacity-50`

const DELETE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast ease-out-quad hover:bg-red/12 hover:text-red
  disabled:opacity-50`

export function EditableTicketRow({ ticket, sprints, onUpdateTicket, onDeleteTicket }) {
  const panelId = useId()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [savingField, setSavingField] = useState(null)
  const [saveError, setSaveError] = useState('')

  const priority = findOption(TICKET_PRIORITY_OPTIONS, ticket.priority)
  const type = findOption(TICKET_TYPE_OPTIONS, ticket.type)
  const checklist = checklistProgress(ticket)

  async function saveField(field, value) {
    setSaveError('')
    setSavingField(field)
    try {
      await onUpdateTicket(ticket, { [field]: value })
    } catch (err) {
      setSaveError(errorMessage(err))
    } finally {
      setSavingField(null)
    }
  }

  return (
    <li className="rounded-control bg-fill-tertiary px-2.5 py-2">
      <div className="flex items-center gap-2">
        {/* The row is already bg-fill-tertiary, so TOGGLE_BUTTON hovers to fill-secondary
            instead: the usual fill-tertiary hover would be invisible here. */}
        <button
          type="button"
          aria-label={isEditing ? 'Cerrar edición' : 'Editar ticket'}
          onClick={() => setIsEditing(!isEditing)}
          aria-expanded={isEditing}
          aria-controls={panelId}
          className={TOGGLE_BUTTON}
        >
          <ChevronRight
            className={cn('size-4 transition-transform duration-fast ease-out-quad', isEditing && 'rotate-90')}
            aria-hidden="true"
          />
        </button>

        <FileText className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />

        <span className="shrink-0 text-caption text-label-tertiary">{ticket.code}</span>

        {type && <Badge tone={type.tone}>{type.short}</Badge>}

        <span className="min-w-0 flex-1 truncate text-subheadline text-label">{ticket.title}</span>

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

        <span className="shrink-0 text-caption font-medium text-label-secondary">{ticket.points} pts</span>

        <Avatar name={ticket.assigneeName} size="sm" />

        <button
          type="button"
          aria-label="Eliminar ticket"
          onClick={() => setIsDeleteOpen(true)}
          className={DELETE_BUTTON}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isEditing && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSoft}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-3 flex flex-col gap-3 border-t border-separator pt-3">
              {saveError && (
                <p role="alert" className="text-footnote text-red">
                  {saveError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-footnote text-label-secondary">
                  Estado
                  <select
                    value={ticket.status}
                    disabled={savingField === 'status'}
                    onChange={(e) => saveField('status', e.target.value)}
                    className={ROW_SELECT}
                  >
                    {TICKET_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-footnote text-label-secondary">
                  Sprint
                  <select
                    value={ticket.sprintId ?? ''}
                    disabled={savingField === 'sprintId'}
                    onChange={(e) => saveField('sprintId', e.target.value)}
                    className={ROW_SELECT}
                  >
                    <option value="">Sin sprint</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-footnote text-label-secondary">
                  Prioridad
                  <select
                    value={ticket.priority}
                    disabled={savingField === 'priority'}
                    onChange={(e) => saveField('priority', e.target.value)}
                    className={ROW_SELECT}
                  >
                    {TICKET_PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <TicketExtrasPanel ticket={ticket} onUpdateTicket={onUpdateTicket} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Eliminar ticket"
        confirmLabel="Eliminar"
        pendingLabel="Eliminando…"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDeleteTicket(ticket)}
      >
        ¿Seguro que querés eliminar <span className="font-medium text-label">"{ticket.title}"</span>?
        Esta acción no se puede deshacer.
      </ConfirmModal>
    </li>
  )
}
