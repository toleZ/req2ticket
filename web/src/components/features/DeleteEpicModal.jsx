import { useCallback, useState } from 'react'

import { Modal } from '@/components/ui/Modal'

export function DeleteEpicModal({ isOpen, epicName, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleClose = useCallback(() => {
    if (submitting) return
    setError('')
    onClose()
  }, [submitting, onClose])

  async function handleConfirm() {
    setError('')
    setSubmitting(true)
    try {
      await onConfirm()
      // El modal se cierra solo si el borrado se confirmó en el backend: si el DELETE
      // falla, sigue abierto con el error arriba, igual que CreateEpicModal.
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Eliminar épica">
      <div className="flex flex-col gap-4">
        {error && (
          <p
            className="rounded-control bg-fill-tertiary px-3 py-2 text-footnote text-red"
            role="alert"
          >
            {error}
          </p>
        )}

        <p className="text-body text-label-secondary">
          ¿Seguro que querés eliminar <span className="font-medium text-label">"{epicName}"</span>?
          Esta acción no se puede deshacer.
        </p>

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-control px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast hover:bg-fill-tertiary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-control bg-red px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
