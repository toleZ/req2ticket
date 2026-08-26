import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, ' +
  '[tabindex]:not([tabindex="-1"])'

/**
 * Accessibility utility — you should not need to change this to add a modal, a page or a
 * nav item. Callers today: components/ui/Modal.jsx and components/layout/MobileDrawer.jsx.
 *
 * Attach the returned ref to a panel. While `isActive`, Tab cycles inside that panel
 * instead of escaping to the page behind it, Escape calls `onEscape`, and closing hands
 * focus back to whatever opened the panel.
 *
 * `onEscape` can be a plain arrow function — you do NOT need useCallback. It is kept in a
 * ref instead of being an effect dependency, so the trap only re-arms when `isActive`
 * flips. That matters: it used to re-arm on every render of the caller, which pulled
 * focus out of the panel and back in each time a modal set its `submitting` state.
 */
export function useFocusTrap(isActive, onEscape) {
  const containerRef = useRef(null)
  const onEscapeRef = useRef(onEscape)

  /* No dependency array: this runs after every render and leaves the latest `onEscape` in
     the ref. The listener below only reads `onEscapeRef.current` when someone presses a
     key, so it always gets the current function. */
  useEffect(() => {
    onEscapeRef.current = onEscape
  })

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
        onEscapeRef.current()
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
  }, [isActive])

  return containerRef
}
