import { useState } from 'react'
import { Ban, MoreHorizontal } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton/IconButton'
import { cn } from '@/lib/cn'
import { ITEM, MENU, REASON } from './BoardCardMenu.styles'

/**
 * The "…" in a card's corner. Cancelling a ticket lives here and not as a column: a cancelled
 * ticket leaves the board. When a rule blocks it (the workflow), the item stays visible,
 * disabled, and says why.
 *
 * It asks first only when the workflow gives cancelled no way out (Board.jsx decides that):
 * otherwise a cancel is undone the same way it was done.
 */
export function BoardCardMenu({ ticket, cancelReason, disabled, onCancel }) {
  const [open, setOpen] = useState(false)

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
    }
  }

  function handleCancel() {
    setOpen(false)
    onCancel(ticket)
  }

  return (
    <div className="absolute right-1.5 top-1.5" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <IconButton
        label={`Más acciones de ${ticket.code}`}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="size-7 lg:size-7"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </IconButton>

      {open && (
        // The click must not move the focus first, or handleBlur closes the menu before it lands.
        <div onMouseDown={(e) => e.preventDefault()} className={MENU}>
          <button
            type="button"
            disabled={Boolean(cancelReason)}
            onClick={handleCancel}
            className={cn(ITEM, cancelReason ? 'text-label-secondary' : 'text-red-text')}
          >
            <Ban className="size-4" aria-hidden="true" />
            Cancelar ticket
          </button>
          {cancelReason && (
            <p className={REASON}>
              {cancelReason}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
