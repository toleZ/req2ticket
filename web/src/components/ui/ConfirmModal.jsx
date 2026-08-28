import { useState } from 'react'

import { Modal } from '@/components/ui/Modal'
import { errorMessage } from '@/lib/errors'

const CANCEL_BUTTON = `inline-flex shrink-0 items-center justify-center gap-2 rounded-control px-4
  py-2 text-body font-medium text-label-secondary transition-colors duration-fast
  hover:bg-fill-tertiary disabled:opacity-50`

/* danger and success differ by the background colour and nothing else, so the ternary below
   picks bg-red or bg-green and this string carries everything they share. Do not build the
   class as `bg-${confirmVariant}`: Tailwind scans the source as text and never sees it. */
const CONFIRM_BUTTON = `inline-flex shrink-0 items-center justify-center gap-2 rounded-control px-4
  py-2 text-body font-medium text-white transition-[filter] duration-fast hover:brightness-110
  disabled:opacity-50`

/**
 * The "are you sure?" modal for an action that cannot be undone. Deleting epics, tickets
 * and sprints uses it, and so does completing a sprint.
 *
 * It handles all the boring parts by itself: it disables the buttons while the request is
 * in flight, shows the error if the backend rejects it, and **only closes on success** —
 * if it fails the modal stays open with the error above so you can retry.
 *
 * `onConfirm` has to return the request's promise (or be `async`), because the modal awaits
 * it to decide whether to close.
 *
 * The question text goes in as children rather than a prop: that way it reads where it is
 * used, and each screen can word its own without inventing new props.
 */
export function ConfirmModal({
  isOpen,
  title,
  confirmLabel,
  pendingLabel,
  confirmVariant = 'danger',
  onClose,
  onConfirm,
  children,
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    if (submitting) return

    setError('')
    onClose()
  }

  async function handleConfirm() {
    setError('')
    setSubmitting(true)
    try {
      await onConfirm()
      setError('')
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="flex flex-col gap-4">
        {error && (
          <p
            className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red"
            role="alert"
          >
            {error}
          </p>
        )}

        <p className="text-body text-label-secondary">{children}</p>

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className={CANCEL_BUTTON}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`${CONFIRM_BUTTON} ${confirmVariant === 'success' ? 'bg-green' : 'bg-red'}`}
          >
            {submitting ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
