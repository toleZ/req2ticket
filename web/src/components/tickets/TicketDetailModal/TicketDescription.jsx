import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { SHEET_TEXTAREA, SIDE_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { DESCRIPTION_PLACEHOLDER } from '@/lib/ticketTypes'

/* A ticket's description, the same box as every other field. A story's placeholder hints at its
   "Como <rol> quiero…" shape; it is only a hint, the text stays free. */
export function TicketDescription({ ticket, value, readOnly, disabled, onChange }) {
  const id = `ticket-${ticket.id}-description`

  return (
    <div>
      <label htmlFor={id} className={SIDE_LABEL}>
        Descripción
      </label>
      {readOnly ? (
        <ReadOnlyValue id={id} variant="field" empty="Sin descripción" className="whitespace-pre-line">
          {ticket.description}
        </ReadOnlyValue>
      ) : (
        <textarea
          id={id}
          rows={3}
          maxLength={2000}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={DESCRIPTION_PLACEHOLDER[ticket.type]}
          className={SHEET_TEXTAREA}
        />
      )}
    </div>
  )
}
