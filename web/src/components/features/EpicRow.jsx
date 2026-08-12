import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Trash2 } from 'lucide-react'

import { DeleteEpicModal } from '@/components/features/DeleteEpicModal'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, findOption, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/lib/epicOptions'
import { springSoft } from '@/lib/motion'

const SELECT_CLASSES =
  'rounded-control border border-separator bg-elevated px-2 py-1 text-footnote text-label disabled:opacity-50'

const TOGGLE_BUTTON = `mt-0.5 grid size-6 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast hover:bg-fill-secondary hover:text-label`

const DELETE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast hover:bg-red/12 hover:text-red`

export function EpicRow({ epic, onUpdateEpic, onDeleteEpic }) {
  const panelId = useId()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [savingField, setSavingField] = useState(null)
  const [saveError, setSaveError] = useState('')

  const accent = findOption(ACCENT_COLORS, epic.accentColor)
  const status = findOption(STATUS_OPTIONS, epic.status)
  const priority = findOption(PRIORITY_OPTIONS, epic.priority)

  async function handleFieldChange(field, value) {
    setSaveError('')
    setSavingField(field)
    try {
      await onUpdateEpic(epic, { [field]: value })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSavingField(null)
    }
  }

  return (
    <li className="rounded-control bg-fill-tertiary px-3 py-2.5">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setIsEditing((value) => !value)}
          aria-expanded={isEditing}
          aria-controls={panelId}
          aria-label={isEditing ? 'Cerrar edición' : 'Editar épica'}
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

          {epic.description && (
            <p className="mt-1 text-footnote text-label-secondary">{epic.description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          aria-label="Eliminar épica"
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
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className={SELECT_CLASSES}
                  >
                    {STATUS_OPTIONS.map((option) => (
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
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className={SELECT_CLASSES}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteEpicModal
        isOpen={isDeleteOpen}
        epicName={epic.name}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDeleteEpic(epic)}
      />
    </li>
  )
}
