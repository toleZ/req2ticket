import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'

import { CreateEpicModal } from '@/components/features/CreateEpicModal'
import { ACCENT_COLORS, findOption, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/lib/epicOptions'

const CREATE_BUTTON = `inline-flex shrink-0 items-center gap-1.5 rounded-control bg-blue
  px-3 py-2 text-subheadline font-medium text-white transition-[filter] duration-fast
  hover:brightness-110`

const BADGE_CLASSES = 'rounded-full px-2 py-0.5 text-caption font-medium'

function EpicBadge({ option }) {
  if (!option) return null
  return <span className={`${BADGE_CLASSES} ${option.badgeClasses}`}>{option.label}</span>
}

export function Features() {
  const [epics, setEpics] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const closeModal = useCallback(() => setIsModalOpen(false), [])

  function handleCreate(epic) {
    setEpics((prev) => [...prev, { id: crypto.randomUUID(), ...epic }])
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title1 text-label">Funcionalidades</h1>
        <button type="button" onClick={() => setIsModalOpen(true)} className={CREATE_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
          Nueva épica
        </button>
      </div>

      {epics.length === 0 ? (
        <p className="mt-2 max-w-prose text-body text-label-secondary">
          Todavía no hay funcionalidades cargadas.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {epics.map((epic) => {
            const accent = findOption(ACCENT_COLORS, epic.accentColor)
            return (
              <li key={epic.id} className="rounded-control bg-fill-tertiary px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {accent && (
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${accent.dotClass}`}
                      aria-hidden="true"
                    />
                  )}
                  <p className="text-body font-medium text-label">{epic.name}</p>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <EpicBadge option={findOption(STATUS_OPTIONS, epic.status)} />
                  <EpicBadge option={findOption(PRIORITY_OPTIONS, epic.priority)} />
                  {epic.ownerId && (
                    <span className="text-footnote text-label-secondary">{epic.ownerId}</span>
                  )}
                </div>

                {epic.description && (
                  <p className="mt-1.5 text-footnote text-label-secondary">{epic.description}</p>
                )}
                {epic.body && (
                  <p className="mt-1 line-clamp-2 text-footnote text-label-tertiary">
                    {epic.body}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <CreateEpicModal isOpen={isModalOpen} onClose={closeModal} onCreate={handleCreate} />
    </section>
  )
}
