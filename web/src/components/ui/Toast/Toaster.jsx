import { useEffect, useRef, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

import { cn } from '@/lib/cn'
import { exitQuick, springSnappy } from '@/lib/motion'
import { dismissToast, getToasts, subscribeToasts } from './toast'
import { ACTION, CLOSE, ICON_CLASSES, MESSAGE, REGION, TOAST } from './Toast.styles'

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info }

/**
 * Draws the toasts. Mount it once, at the end of AppShell. To show one, call `toast.success()`
 * (see toast.js) from anywhere: a mutation's onSuccess, a modal, a 403 handler.
 *
 * The region is always on the page, even empty: a live region only announces changes to
 * something that was already there.
 */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts)

  return (
    <section aria-label="Notificaciones" className={REGION}>
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </section>
  )
}

function ToastItem({ item }) {
  const Icon = ICONS[item.tone]
  const timer = useRef(null)

  function start() {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => dismissToast(item.id), item.duration)
  }

  function pause() {
    clearTimeout(timer.current)
  }

  /* The timer pauses while the pointer or the keyboard is on the toast, so nobody loses a
     message halfway through reading it. */
  useEffect(() => {
    start()
    return pause
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      layout
      role={item.tone === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: exitQuick }}
      transition={springSnappy}
      onPointerEnter={pause}
      onPointerLeave={start}
      onFocus={pause}
      onBlur={start}
      className={TOAST}
    >
      <Icon className={cn('mt-0.5 size-4.5 shrink-0', ICON_CLASSES[item.tone])} aria-hidden="true" />
      <p className={MESSAGE}>{item.message}</p>
      {item.action && (
        <button
          type="button"
          onClick={() => {
            item.action.onClick()
            dismissToast(item.id)
          }}
          className={ACTION}
        >
          {item.action.label}
        </button>
      )}
      <button type="button" aria-label="Cerrar aviso" onClick={() => dismissToast(item.id)} className={CLOSE}>
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  )
}
