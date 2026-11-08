import { useEffect } from 'react'

/**
 * While `isActive`, pressing Escape anywhere on the page calls `onEscape`. Modal and
 * MobileDrawer use it to close.
 *
 *     useEscapeKey(isOpen, onClose)
 *
 * A dropdown inside a modal (Select, DatePicker, a menu) closes itself on Escape first and calls
 * e.stopPropagation(), so the same key press does not reach this listener and close the modal.
 */
export function useEscapeKey(isActive, onEscape) {
  useEffect(() => {
    if (!isActive) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onEscape()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onEscape])
}
