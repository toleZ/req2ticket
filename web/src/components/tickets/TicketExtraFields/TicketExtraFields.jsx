import { ChecklistField } from '@/components/tickets/ChecklistField/ChecklistField'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { SHEET_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { cn } from '@/lib/cn'
import { EXTRA_FIELDS, FIELD_SECTIONS } from '@/lib/ticketExtraFields'
import {
  CARD,
  CARD_HEAD,
  CARD_TITLE,
  CONTROL,
  ERROR_TEXT,
  LABEL_TONE,
  OPTIONAL,
  SECTION_TITLE,
} from './TicketExtraFields.styles'

/**
 * The extra fields of a ticket type, laid out the way its sheet reads: the fields come from
 * EXTRA_FIELDS, and so does how they sit — a section heading where a section starts, two
 * `pair` fields side by side, checklists as cards. The create modal and the detail sheet both
 * draw it, so the two always look alike.
 *
 * It has no state of its own: whoever uses it owns `values` and gets every change through
 * `onChange(name, value)`. `kinds` limits what is drawn (the detail sheet puts the selects in
 * its side column), and `optional` adds the "(opcional)" the create sheet shows.
 */
export function TicketExtraFields({
  type,
  values,
  onChange,
  disabled,
  idPrefix,
  kinds,
  optional = false,
  onChecklistToggle,
  checklistError,
}) {
  const all = EXTRA_FIELDS[type] || []
  const fields = kinds ? all.filter((field) => kinds.includes(field.kind)) : all

  /* Rows of one field, or of two when two `pair` fields follow each other. */
  const rows = []
  fields.forEach((field) => {
    const last = rows[rows.length - 1]
    if (field.pair && last && last.length === 1 && last[0].pair) {
      last.push(field)
    } else {
      rows.push([field])
    }
  })

  return (
    <>
      {rows.map((row, index) => {
        const section = row[0].section
        const startsSection = section && (index === 0 || rows[index - 1][0].section !== section)

        return (
          <div key={row[0].name} className="flex flex-col gap-5">
            {startsSection && <SectionHeading section={FIELD_SECTIONS[section]} />}

            <div className={row.length === 2 ? 'grid gap-4 md:grid-cols-2' : undefined}>
              {row.map((field) => (
                <FieldBlock
                  key={field.name}
                  field={field}
                  id={`${idPrefix}-${field.name}`}
                  value={values[field.name]}
                  disabled={disabled}
                  optional={optional}
                  onChange={onChange}
                  onChecklistToggle={onChecklistToggle}
                  error={checklistError?.name === field.name ? checklistError.message : ''}
                />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}

function SectionHeading({ section }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <h3 className={SECTION_TITLE}>
        {section.title}
      </h3>
      <span className="h-px flex-1 bg-separator" aria-hidden="true" />
      <span className="text-caption text-label-secondary">{section.hint}</span>
    </div>
  )
}

function FieldBlock({ field, id, value, disabled, optional, onChange, onChecklistToggle, error }) {
  if (field.kind === 'checklist') {
    return (
      <ChecklistCard
        id={id}
        field={field}
        items={value}
        disabled={disabled}
        onChange={onChange}
        onToggle={onChecklistToggle}
        error={error}
      />
    )
  }

  const label = (
    <label htmlFor={id} className={cn(SHEET_LABEL, LABEL_TONE[field.tone] ?? 'text-label-secondary')}>
      {field.label} {optional && <span className={OPTIONAL}>(opcional)</span>}
    </label>
  )

  if (field.kind === 'textarea') {
    return (
      <div>
        {label}
        <textarea
          id={id}
          rows={3}
          value={value}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={cn(CONTROL, 'resize-none')}
        />
      </div>
    )
  }

  if (field.kind === 'select') {
    return (
      <div>
        {label}
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={CONTROL}
        >
          <option value="">Sin definir</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div>
      {label}
      <input
        id={id}
        value={value}
        placeholder={field.placeholder}
        disabled={disabled}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={cn(CONTROL, field.mono && 'mono text-footnote')}
      />
    </div>
  )
}

/* A checklist as a card: its name, "3/5" and the bar on top, the items below. */
function ChecklistCard({ id, field, items, disabled, onChange, onToggle, error }) {
  const done = items.filter((item) => item.done).length

  const head = (
    <>
      <span className={CARD_TITLE}>
        {field.label}
      </span>
      {items.length > 0 && (
        <span className="ml-auto flex items-center gap-2">
          <span className="mono text-caption text-label-secondary">
            {done}/{items.length}
          </span>
          <ProgressBar
            value={done}
            max={items.length}
            size="sm"
            label={`${field.label}: ${done} de ${items.length}`}
            className="w-14"
          />
        </span>
      )}
    </>
  )

  const list = (
    <ChecklistField
      id={id}
      items={items}
      disabled={disabled}
      addLabel={field.addLabel}
      onItemsChange={(nextItems) => onChange(field.name, nextItems)}
      onToggle={onToggle && ((nextItems) => onToggle(field.name, nextItems))}
    />
  )

  return (
    <div>
      <div className={CARD}>
        <div className={cn(CARD_HEAD, 'rounded-t-card')}>{head}</div>
        {list}
      </div>

      {error && (
        <p role="alert" className={ERROR_TEXT}>
          {error}
        </p>
      )}
    </div>
  )
}
