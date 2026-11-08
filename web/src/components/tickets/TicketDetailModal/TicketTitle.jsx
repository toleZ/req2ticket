import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { RequiredMark } from '@/components/ui/SheetField/SheetField'
import { FIELD_ERROR, SHEET_TEXTAREA, SIDE_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { cn } from '@/lib/cn'

/* A ticket's title, the same box as the description and the type's fields below it (and as the
   title in the create sheet). */
export function TicketTitle({ ticket, value, readOnly, disabled, error, onChange }) {
  const id = `ticket-${ticket.id}-title`
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className={SIDE_LABEL}>
        Título
        {!readOnly && <RequiredMark />}
      </label>
      {readOnly ? (
        <ReadOnlyValue id={id} variant="field">
          {ticket.title}
        </ReadOnlyValue>
      ) : (
        <input
          id={id}
          maxLength={160}
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(SHEET_TEXTAREA, error && 'border-red')}
        />
      )}
      {error && (
        <p id={errorId} role="alert" className={FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  )
}
