import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button/Button'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { CONTROL } from '@/components/ui/Field/Field.styles'
import { errorMessage } from '@/lib/errors'

/**
 * The "are you sure?" modal for an action that cannot be undone. Deleting epics, tickets
 * and sprints uses it, and so do starting and completing a sprint.
 * `confirmVariant` is any Button variant: `primary` to start, `success` to complete.
 *
 * It handles all the boring parts by itself: it disables the buttons while the request is
 * in flight, shows the error if the backend rejects it, and **only closes on success** —
 * if it fails the modal stays open with the error above so you can retry.
 *
 * `onConfirm` has to return the request's promise (or be `async`), because the modal awaits
 * it to decide whether to close.
 *
 * The message goes in as children rather than a prop: that way it reads where it is used,
 * and each screen can word its own without inventing new props. It may hold more than one
 * paragraph or a list (the codes of the children that go with a ticket).
 *
 * `confirmText`: for the worst cases (deleting a project). The button stays off until the
 * person types that exact text, usually the project's Key.
 *
 * The focus starts on Cancelar, or on the text box when there is one: an Enter pressed in a
 * hurry never confirms.
 */
export function ConfirmModal({
  isOpen,
  title,
  confirmLabel,
  pendingLabel,
  confirmVariant = 'danger',
  confirmText,
  onClose,
  onConfirm,
  children,
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [typed, setTyped] = useState('')
  const inputId = useId()
  const footerRef = useRef(null)
  const inputRef = useRef(null)

  /* Runs after Modal's own effect, which focuses the panel: children's effects run first, and
     Modal is this component's child. So this one gets the last word. */
  useEffect(() => {
    if (!isOpen) return
    if (confirmText) inputRef.current?.focus()
    else footerRef.current?.querySelector('button')?.focus()
  }, [isOpen, confirmText])

  const matches = !confirmText || typed.trim() === confirmText

  function handleClose() {
    if (submitting) return

    setError('')
    setTyped('')
    onClose()
  }

  async function handleConfirm() {
    if (!matches) return
    setError('')
    setSubmitting(true)
    try {
      await onConfirm()
      setError('')
      setTyped('')
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
        <div className="flex flex-col gap-2 text-body text-label-secondary">{children}</div>

        {confirmText && (
          <div>
            <label htmlFor={inputId} className="mb-1 block text-subheadline text-label">
              Escribí <strong className="font-mono font-semibold">{confirmText}</strong> para confirmar
            </label>
            <input
              ref={inputRef}
              id={inputId}
              value={typed}
              autoComplete="off"
              spellCheck={false}
              disabled={submitting}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              className={`${CONTROL} font-mono`}
            />
          </div>
        )}

        <div ref={footerRef} className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={submitting || !matches}>
            {submitting ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
