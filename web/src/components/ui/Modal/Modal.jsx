import { useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { EASE_IOS, springSoft } from '@/lib/motion'
import { PANEL_BASE, SCRIM, SIZE_CLASSES } from './Modal.styles'
/**
 * The modal sheet: scrim, panel, trapped focus and the enter/exit animation.
 *
 * Two sizes. `md` (the usual one) draws its own title bar from `title` and leaves the content
 * to `children`. `lg` draws nothing: whoever uses it paints its own header, body and footer,
 * and passes `ariaLabel` instead of `title` so the dialog still has an accessible name.
 */
export function Modal({ isOpen, onClose, title, ariaLabel, size = 'md', children }) {
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
            /* With `title` the name comes from the <h2> below; without it, from the text
               passed in. A dialog with neither is announced as just "dialog". */
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : ariaLabel}
            tabIndex={-1}
            className={`${PANEL_BASE} ${SIZE_CLASSES[size]}`}
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
                <IconButton label="Cerrar" onClick={onClose}>
                  <X className="size-4.5" aria-hidden="true" />
                </IconButton>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
