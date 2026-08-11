import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, ' +
  '[tabindex]:not([tabindex="-1"])'

/**
 * Accessibility utility — you should not need to change this to add a page or a nav
 * item. It only has one caller: MobileDrawer.
 *
 * Attach the returned ref to a panel. While `isActive`, Tab cycles inside that panel
 * instead of escaping to the page behind it, Escape calls `onEscape`, and closing hands
 * focus back to whatever opened the panel.
 *
 * `onEscape` must keep the same identity across renders (wrap it in useCallback) — it is
 * an effect dependency, so a fresh arrow every render re-arms the trap and drags focus
 * back to the top of the panel.
 */
export function useFocusTrap(isActive, onEscape) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!isActive || !container) return

    /* StrictMode runs this effect twice. On the second pass the container already holds
       focus, so only remember a trigger that lives outside it — otherwise closing
       returns focus to the panel instead of the button that opened it. */
    const trigger = container.contains(document.activeElement) ? null : document.activeElement
    container.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onEscape()
        return
      }
      if (e.key !== 'Tab') return

      const items = container.querySelectorAll(FOCUSABLE)
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      trigger?.focus?.()
    }
  }, [isActive, onEscape])

  return containerRef
}
