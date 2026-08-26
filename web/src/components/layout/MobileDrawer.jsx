import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { SidebarBody } from '@/components/layout/SidebarBody'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { EASE_IOS, springSoft } from '@/lib/motion'

const DRAWER_SCRIM = 'fixed inset-0 z-40 bg-scrim lg:hidden'
const DRAWER_PANEL = `material-thick hairline-r fixed inset-y-0 left-0 z-50 flex w-68
  flex-col overflow-hidden focus:outline-none lg:hidden`

const DESKTOP_QUERY = '(min-width: 64rem)'

export function MobileDrawer({ isOpen, onClose }) {
  const panelRef = useFocusTrap(isOpen, onClose)

  /* Crossing into the desktop breakpoint reveals the rail. Leaving the drawer mounted
     would keep a focus trap alive over something nobody can see. */
  useEffect(() => {
    if (!isOpen) return

    const media = window.matchMedia(DESKTOP_QUERY)
    function handleBreakpointChange(e) {
      if (e.matches) onClose()
    }

    media.addEventListener('change', handleBreakpointChange)
    return () => media.removeEventListener('change', handleBreakpointChange)
  }, [isOpen, onClose])

  return (
    /* AnimatePresence keeps its children mounted after isOpen turns false, just long
       enough to play `exit`. Without it the drawer would vanish instantly on close. */
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Sibling of the panel, never its parent: nesting two backdrop-filters blurs twice. */}
          <motion.div
            className={DRAWER_SCRIM}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_IOS }}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
            tabIndex={-1}
            className={DRAWER_PANEL}
            /* No reduced-motion branch: MotionConfig in main.jsx drops the x and keeps
               the opacity, so this fades in place for anyone who asked for less motion. */
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={springSoft}
          >
            <SidebarBody surface="drawer" onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
