import { useEffect, useState } from 'react'
import { Check, Copy, Trash2, X } from 'lucide-react'
import { CODE_BUTTON, HEADER } from './DetailHeader.styles'

import { IconButton } from '@/components/ui/IconButton/IconButton'

/**
 * The bar across the top of a detail sheet: a leading mark, the copyable code, the status
 * badge, then the delete and close buttons pushed to the right.
 *
 * It owns the clipboard behaviour, which is why this is a component and not a class constant.
 * Both detail modals had the same `copied` state, the same 1.5s timer and the same async
 * handler, character for character.
 *
 * `leading` is a node because the two callers put different things there: the ticket shows its
 * type icon, the epic its accent dot.
 *
 * Note `disabled` reaches the delete button only. The close button is never disabled — while a
 * save is in flight you must still be able to give up on the sheet.
 */
export function DetailHeader({
  leading,
  code,
  badge,
  deleteLabel,
  onDelete,
  onClose,
  disabled = false,
}) {
  const [copied, setCopied] = useState(false)

  /* The "copied" tick switches itself off. The timer is cleared in the cleanup: without that,
     closing the sheet before it finishes would leave a setTimeout pointing at a component that
     is no longer there. */
  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopyCode() {
    /* navigator.clipboard does not exist outside HTTPS or localhost, and the browser can deny
       permission. There is no plan B: if it fails, the tick simply does not appear. */
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={HEADER}>
      {leading}

      <button
        type="button"
        onClick={handleCopyCode}
        aria-label={copied ? 'Código copiado' : `Copiar ${code}`}
        className={CODE_BUTTON}
      >
        {code}
        {copied ? (
          <Check className="size-3.5 text-green" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>

      {badge}

      <span className="flex-1" />

      <IconButton label={deleteLabel} variant="danger" disabled={disabled} onClick={onDelete}>
        <Trash2 className="size-4" aria-hidden="true" />
      </IconButton>

      <IconButton label="Cerrar" onClick={onClose}>
        <X className="size-4.5" aria-hidden="true" />
      </IconButton>
    </div>
  )
}
