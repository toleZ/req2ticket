import { FOOTER, NOTE } from './DetailFooter.styles'
import { Button } from '@/components/ui/Button/Button'

/**
 * The foot of a detail sheet, which has three faces: the normal one, the "are you sure you
 * want to delete it?" and the "you have unsaved changes".
 *
 * All three live here rather than in a ConfirmModal on top, because two modals at once are two
 * live useFocusTraps, and that hook listens for Escape on `document`: one key press would close
 * both. Swapping the footer has no such problem, and it does not cover up what you are about
 * to lose.
 *
 * **This component holds no state.** `mode` is the parent's own useState value, and the parent
 * keeps handleRequestClose, which is what actually drives the transitions:
 *
 *     submitting        → do nothing
 *     mode !== 'edit'   → back to 'edit'
 *     dirty             → 'confirmDiscard'
 *     otherwise         → close
 *
 * That way a reader of the modal still sees the whole state machine in that file; only the
 * markup moved here. No reducer, no effect — three `mode === '…' &&` blocks.
 *
 * The submit button needs no handler: this renders inside the parent's <form>, so
 * `type="submit"` reaches its onSubmit.
 *
 * `confirmDeleteMessage` is a node and not a string because the epic's version interpolates a
 * plural into it.
 */
export function DetailFooter({
  mode,
  error,
  submitting = false,
  confirmDeleteMessage,
  onExitConfirm,
  onDelete,
  onCancel,
  onDiscard,
}) {
  return (
    <div className={FOOTER}>
      {error && (
        <p role="alert" className="mr-auto text-footnote text-red">
          {error}
        </p>
      )}

      {mode === 'edit' && (
        <>
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </>
      )}

      {mode === 'confirmDelete' && (
        <>
          <p className={NOTE}>{confirmDeleteMessage}</p>
          <Button variant="ghost" onClick={onExitConfirm} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={submitting}>
            {submitting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </>
      )}

      {mode === 'confirmDiscard' && (
        <>
          <p className={NOTE}>Hay cambios sin guardar. Si salís ahora se pierden.</p>
          <Button variant="ghost" onClick={onExitConfirm}>
            Seguir editando
          </Button>
          <Button variant="danger" onClick={onDiscard}>
            Descartar
          </Button>
        </>
      )}
    </div>
  )
}
