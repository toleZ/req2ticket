import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Trash2 } from 'lucide-react'

import { TicketSummaryList } from '@/components/tickets/TicketSummaryList'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { findOption } from '@/lib/options'
import { springSoft } from '@/lib/motion'
import { summarizeTickets } from '@/lib/ticketStats'

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

export function EpicRow({ epic, tickets, onUpdateEpic, onDeleteEpic }) {
  const panelId = useId()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [savingField, setSavingField] = useState(null)
  const [saveError, setSaveError] = useState('')

  const accent = findOption(ACCENT_COLORS, epic.accentColor)
  const status = findOption(EPIC_STATUS_OPTIONS, epic.status)
  const priority = findOption(EPIC_PRIORITY_OPTIONS, epic.priority)
  const stats = summarizeTickets(tickets)

  async function saveField(field, value) {
    setSaveError('')
    setSavingField(field)
    try {
      await onUpdateEpic(epic, { [field]: value })
    } catch (err) {
      setSaveError(errorMessage(err))
    } finally {
      setSavingField(null)
    }
  }

  return (
    <li className="rounded-control bg-fill-tertiary px-3 py-2.5">
      <div className="flex items-start gap-2">
        {/* The row is already bg-fill-tertiary, so TOGGLE_BUTTON hovers to fill-secondary
            instead: the usual fill-tertiary hover would be invisible here. */}
        <button
          type="button"
          aria-label={isEditing ? 'Cerrar edición' : 'Editar épica'}
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

        {accent && (
          <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', accent.dotClass)} aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-label-tertiary">{epic.code}</span>
            <h3 className="text-body font-medium text-label">{epic.name}</h3>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}
            {epic.ownerName && (
              <span className="text-footnote text-label-secondary">{epic.ownerName}</span>
            )}
          </div>

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

        <button
          type="button"
          aria-label="Eliminar épica"
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
                    value={epic.status}
                    disabled={savingField === 'status'}
                    onChange={(e) => saveField('status', e.target.value)}
                    className={ROW_SELECT}
                  >
                    {EPIC_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-footnote text-label-secondary">
                  Prioridad
                  <select
                    value={epic.priority}
                    disabled={savingField === 'priority'}
                    onChange={(e) => saveField('priority', e.target.value)}
                    className={ROW_SELECT}
                  >
                    {EPIC_PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <p className="text-footnote font-medium text-label-secondary">Tickets</p>
                {stats.total === 0 ? (
                  <p className="mt-1.5 text-footnote text-label-tertiary">
                    Esta épica todavía no tiene tickets.
                  </p>
                ) : (
                  <div className="mt-1.5">
                    <TicketSummaryList tickets={tickets} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Eliminar épica"
        confirmLabel="Eliminar"
        pendingLabel="Eliminando…"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDeleteEpic(epic)}
      >
        ¿Seguro que querés eliminar <span className="font-medium text-label">"{epic.name}"</span>?
        Esta acción no se puede deshacer.
      </ConfirmModal>
    </li>
  )
}
