import { ChecklistField } from '@/components/tickets/ChecklistField/ChecklistField'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { RequiredMark } from '@/components/ui/SheetField/SheetField'
import { SHEET_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { cn } from '@/lib/cn'
import {
  CARD,
  CARD_HEAD,
  CARD_TITLE,
  CONTROL,
  ERROR_TEXT,
  LABEL_TONE,
  OPTIONAL,
  SECTION_TITLE,
} from './TicketTypeFields.styles'

/* The building blocks of the four type components (UserStoryFields, TaskFields, BugFields,
   FixFields). Each one gets `field`: { name, label, value, error, … } plus the shared `form`
   props the type component passes down: { disabled, readOnly, optional, idPrefix, onChange }. */

/* The label above a field: its colour (`tone`: green/red for expected/actual result), the
   required mark, and "(opcional)" on the create sheet. */
function FieldLabel({ id, label, tone, required, form }) {
  return (
    <label htmlFor={id} className={cn(SHEET_LABEL, LABEL_TONE[tone] ?? 'text-label-secondary')}>
      {label}
      {required && !form.readOnly && <RequiredMark />}
      {form.optional && !required && <span className={OPTIONAL}> (opcional)</span>}
    </label>
  )
}

function FieldError({ id, error }) {
  if (!error) return null
  return (
    <p id={id} role="alert" className={ERROR_TEXT}>
      {error}
    </p>
  )
}

/* "1650 / 2000" once the text reaches 80% of the API's limit (ENT-6): a long text sees it
   coming, a short one never has it in the way. */
function Counter({ value, maxLength }) {
  const length = value?.length ?? 0
  if (!maxLength || length < maxLength * 0.8) return null

  return (
    <p
      className={cn(
        'mt-1 animate-fade-in text-right text-caption tabular-nums',
        length >= maxLength ? 'font-medium text-red-text' : 'text-label-secondary',
      )}
    >
      {length} / {maxLength}
    </p>
  )
}

/* A heading that opens a group of fields: "AL REPORTAR ——— lo que hace falta para verlo fallar". */
export function SectionHeading({ title, hint }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <h3 className={SECTION_TITLE}>{title}</h3>
      <span className="h-px flex-1 bg-separator" aria-hidden="true" />
      <span className="text-caption text-label-secondary">{hint}</span>
    </div>
  )
}

/* A multi-line text (steps, causes, results), with a counter near the limit. */
export function LongTextField({ form, name, label, value, maxLength, placeholder, required, tone, error }) {
  const id = `${form.idPrefix}-${name}`
  const errorId = `${id}-error`

  return (
    <div>
      <FieldLabel id={id} label={label} tone={tone} required={required} form={form} />
      {form.readOnly ? (
        <ReadOnlyValue id={id} variant="field" className="whitespace-pre-line">
          {value}
        </ReadOnlyValue>
      ) : (
        <>
          <textarea
            id={id}
            rows={3}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={form.disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => form.onChange(name, e.target.value)}
            className={cn(CONTROL, 'resize-none', error && 'border-red')}
          />
          <Counter value={value} maxLength={maxLength} />
        </>
      )}
      <FieldError id={errorId} error={error} />
    </div>
  )
}

/* A one-line text. `mono` for technical values (versions, browsers). */
export function ShortTextField({ form, name, label, value, maxLength, placeholder, mono, error }) {
  const id = `${form.idPrefix}-${name}`
  const errorId = `${id}-error`

  return (
    <div>
      <FieldLabel id={id} label={label} form={form} />
      {form.readOnly ? (
        <ReadOnlyValue id={id} variant="field" className={cn(mono && 'mono text-footnote')}>
          {value}
        </ReadOnlyValue>
      ) : (
        <input
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={form.disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => form.onChange(name, e.target.value)}
          className={cn(CONTROL, mono && 'mono text-footnote', error && 'border-red')}
        />
      )}
      <FieldError id={errorId} error={error} />
    </div>
  )
}

/* A checklist as a card: its name, "3/5" and the bar on top, the items below.

   `form.onChecklistToggle(name, items)`, when given (the detail sheet), saves a tick at once;
   adding, editing or removing an item still goes through `form.onChange` and waits for Guardar. */
export function ChecklistCard({ form, name, label, items, addLabel, error }) {
  const done = items.filter((item) => item.done).length

  return (
    <div>
      <div className={CARD}>
        <div className={cn(CARD_HEAD, 'rounded-t-card')}>
          <span className={CARD_TITLE}>{label}</span>
          {items.length > 0 && (
            <span className="ml-auto flex items-center gap-2">
              <span className="mono text-caption text-label-secondary">
                {done}/{items.length}
              </span>
              <ProgressBar value={done} max={items.length} size="sm" label={`${label}: ${done} de ${items.length}`} className="w-14" />
            </span>
          )}
        </div>
        <ChecklistField
          id={`${form.idPrefix}-${name}`}
          items={items}
          disabled={form.disabled}
          readOnly={form.readOnly}
          addLabel={addLabel}
          onItemsChange={(nextItems) => form.onChange(name, nextItems)}
          onToggle={form.onChecklistToggle && ((nextItems) => form.onChecklistToggle(name, nextItems))}
        />
      </div>
      <FieldError error={error} />
    </div>
  )
}
