import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, FileText, Trash2 } from 'lucide-react'

import { DeleteStoryModal } from '@/components/features/DeleteStoryModal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { findOption } from '@/lib/epicOptions'
import { springSoft } from '@/lib/motion'
import { STORY_PRIORITY_OPTIONS, STORY_STATUS_OPTIONS } from '@/lib/storyOptions'

const SELECT_CLASSES =
  'rounded-control border border-separator bg-elevated px-2 py-1 text-footnote text-label disabled:opacity-50'

const TOGGLE_BUTTON = `mt-0.5 grid size-6 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast hover:bg-fill-secondary hover:text-label`

const DELETE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast hover:bg-red/12 hover:text-red`

export function StoryRow({ story, onUpdateStory, onDeleteStory }) {
  const panelId = useId()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [savingField, setSavingField] = useState(null)
  const [saveError, setSaveError] = useState('')

  const priority = findOption(STORY_PRIORITY_OPTIONS, story.priority)

  async function handleFieldChange(field, value) {
    setSaveError('')
    setSavingField(field)
    try {
      await onUpdateStory(story, { [field]: value })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSavingField(null)
    }
  }

  return (
    <li className="rounded-control bg-fill-tertiary px-2.5 py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing((value) => !value)}
          aria-expanded={isEditing}
          aria-controls={panelId}
          aria-label={isEditing ? 'Cerrar edición' : 'Editar historia'}
          className={TOGGLE_BUTTON}
        >
          <ChevronRight
            className={cn('size-4 transition-transform duration-fast ease-out-quad', isEditing && 'rotate-90')}
            aria-hidden="true"
          />
        </button>

        <FileText className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />

        <span className="shrink-0 text-caption text-label-tertiary">{story.code}</span>

        <span className="min-w-0 flex-1 truncate text-subheadline text-label">{story.title}</span>

        {story.epicName && <Badge tone="neutral">{story.epicName}</Badge>}

        <span className="flex shrink-0 items-center gap-1.5">
          <span className="text-caption text-label-tertiary">
            {story.criteriaDone}/{story.criteriaTotal} criterios
          </span>
          <ProgressBar value={story.criteriaDone} max={story.criteriaTotal} size="sm" className="w-14" />
        </span>

        {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}

        <span className="shrink-0 text-caption font-medium text-label-secondary">{story.points} pts</span>

        <Avatar name={story.assigneeName} size="sm" />

        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          aria-label="Eliminar historia"
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
                    value={story.status}
                    disabled={savingField === 'status'}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className={SELECT_CLASSES}
                  >
                    {STORY_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-footnote text-label-secondary">
                  Prioridad
                  <select
                    value={story.priority}
                    disabled={savingField === 'priority'}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className={SELECT_CLASSES}
                  >
                    {STORY_PRIORITY_OPTIONS.map((option) => (
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

      <DeleteStoryModal
        isOpen={isDeleteOpen}
        storyTitle={story.title}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDeleteStory(story)}
      />
    </li>
  )
}
