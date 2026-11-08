/* The toast queue. Any file can show a toast without props or context:

       import { toast } from '@/components/ui/Toast/toast'
       toast.success('Sprint completado. 4 tickets movidos a Sprint 5')
       toast.error('Tus permisos en este proyecto cambiaron')

   <Toaster /> is mounted once, in AppShell, and draws whatever is in here. You do not need
   to read the rest of this file to use it. */

const MAX_VISIBLE = 3

let toasts = []
let nextId = 1
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

function show(tone, message, options = {}) {
  const id = nextId++
  /* Errors stay longer: they usually ask the person to do something. */
  const duration = options.duration ?? (tone === 'error' ? 6000 : 4000)
  toasts = [...toasts, { id, tone, message, action: options.action, duration }].slice(-MAX_VISIBLE)
  emit()
  return id
}

export function dismissToast(id) {
  toasts = toasts.filter((item) => item.id !== id)
  emit()
}

export function subscribeToasts(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getToasts() {
  return toasts
}

/* `options.action` is `{ label, onClick }`, for a single "Deshacer" or "Ver" button. */
export const toast = {
  success: (message, options) => show('success', message, options),
  error: (message, options) => show('error', message, options),
  info: (message, options) => show('info', message, options),
}
