import { useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

import { useFocusTrap } from '@/hooks/useFocusTrap'
import { EASE_IOS, springSoft } from '@/lib/motion'

const SCRIM = 'fixed inset-0 z-40 bg-scrim'

/* `h-fit` keeps a short modal short, and `max-h` + `overflow-y-auto` keep a tall one from
   growing past the screen: the new-ticket form is fourteen fields for a bug, and without
   this the Crear button ends up below the fold with no way to scroll to it. `inset-4` is
   the margin, so the maximum is the viewport minus those two. */
const PANEL = `fixed inset-4 z-50 m-auto h-fit max-h-[calc(100dvh-2rem)] w-full max-w-md
  overflow-y-auto rounded-sheet bg-elevated p-6 shadow-popover surface-highlight
  ring-[0.5px] ring-separator focus:outline-none`

const CLOSE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-secondary
  transition-colors duration-fast ease-out-quad hover:bg-fill-tertiary hover:text-label
  disabled:opacity-50`

export function Modal({ isOpen, onClose, title, children }) {
  const titleId = useId()
  const panelRef = useFocusTrap(isOpen, onClose)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={SCRIM}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_IOS }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={PANEL}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={springSoft}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 id={titleId} className="text-title3 text-label">
                  {title}
                </h2>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={onClose}
                  className={CLOSE_BUTTON}
                >
                  <X className="size-4.5" aria-hidden="true" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
