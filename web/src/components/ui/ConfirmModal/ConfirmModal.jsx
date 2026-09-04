import { useState } from 'react'

import { Button } from '@/components/ui/Button/Button'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { errorMessage } from '@/lib/errors'

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
        {error && <FormError>{error}</FormError>}

        <p className="text-body text-label-secondary">{children}</p>

        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant={confirmVariant === 'success' ? 'success' : 'danger'}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
