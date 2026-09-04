import { ChecklistField } from '@/components/tickets/ChecklistField/ChecklistField'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { EXTRA_FIELDS } from '@/lib/ticketExtraFields'

const CHECKLIST_LABEL = 'text-subheadline font-medium text-label'

const LABEL = 'mb-1 block text-subheadline font-medium text-label'

const OPTIONAL = 'font-normal text-label-tertiary'

const CONTROL = `w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2
  text-body text-label transition-colors duration-fast placeholder:text-label-tertiary
  hover:border-separator-opaque disabled:opacity-50`

const CONTROL_TEXTAREA = `${CONTROL} resize-none`

/**
 * Draws the extra fields of whichever type it is given. It is the same component for all four
 * types: the field list comes from EXTRA_FIELDS and all that is decided here, field by field,
 * is which HTML tag it gets. Four copied forms would be four places to fix the same bug.
 *
 * It deliberately has no state of its own. Whoever uses it (the create modal or the detail
 * one) owns `values` and receives every change through `onChange(name, value)`. That is what
 * lets the same component serve both places without a single differing line.
 *
 * `kinds` limits what gets drawn. The detail modal uses it to keep the text fields and the
 * checklists and leave the `select`s (a bug's severity, a fix's risk) for the right-hand
 * column, next to Prioridad — which is where they read best. Without the prop everything is
 * drawn, which is what the create modal wants.
 *
 * `optional` decides whether the fields carry the grey "(opcional)". On create yes (every
 * extra field can be left empty); on detail no, because "Criterios de aceptación (opcional)"
 * on a record reads as though they did not matter.
 *
 * None of them is validated, so none carries the error <p> or its aria.
 *
 * The blocks are `condition && <tag/>` one under the other, not a six-level nested ternary:
 * each line reads on its own, and adding a `kind` is adding a block.
 */
export function TicketExtraFields({
  type,
  values,
  onChange,
  disabled,
  idPrefix,
  kinds,
  optional = false,
}) {
  const all = EXTRA_FIELDS[type] || []
  const fields = kinds ? all.filter((field) => kinds.includes(field.kind)) : all

  return (
    <>
      {fields.map((field) => {
        const id = `${idPrefix}-${field.name}`

        return (
          <div key={field.name}>
            {field.kind === 'text' && (
              <>
                <label htmlFor={id} className={LABEL}>
                  {field.label} {optional && <span className={OPTIONAL}>(opcional)</span>}
                </label>
                <input
                  id={id}
                  value={values[field.name]}
                  disabled={disabled}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className={CONTROL}
                />
              </>
            )}

            {field.kind === 'textarea' && (
              <>
                <label htmlFor={id} className={LABEL}>
                  {field.label} {optional && <span className={OPTIONAL}>(opcional)</span>}
                </label>
                <textarea
                  id={id}
                  rows={3}
                  value={values[field.name]}
                  disabled={disabled}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className={CONTROL_TEXTAREA}
                />
              </>
            )}

            {field.kind === 'select' && (
              <>
                <label htmlFor={id} className={LABEL}>
                  {field.label} {optional && <span className={OPTIONAL}>(opcional)</span>}
                </label>
                <select
                  id={id}
                  value={values[field.name]}
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
              </>
            )}

            {/* The checklist does not get the loose label: its header also carries the counter
                and the bar, and the <label> points at the "add" input. */}
            {field.kind === 'checklist' && (
              <ChecklistBlock
                id={id}
                field={field}
                items={values[field.name]}
                disabled={disabled}
                onChange={onChange}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

/* A checklist's header: label, "N de M" and the thin bar, as in the design. It lives in this
   file and not in ChecklistField because ChecklistField draws the list and nothing else — it
   still works without a header if that is ever needed. */
function ChecklistBlock({ id, field, items, disabled, onChange }) {
  const done = items.filter((item) => item.done).length

  return (
    <div>
      <div className="mb-1 flex items-center gap-2.5">
        <label htmlFor={id} className={CHECKLIST_LABEL}>
          {field.label}
        </label>

        {items.length > 0 && (
          <>
            <span className="shrink-0 text-caption text-label-tertiary">
              {done} de {items.length}
            </span>
            <ProgressBar
              value={done}
              max={items.length}
              size="sm"
              className="w-24 max-w-[40%]"
            />
          </>
        )}
      </div>

      <ChecklistField
        id={id}
        items={items}
        disabled={disabled}
        addLabel={field.addLabel}
        onItemsChange={(nextItems) => onChange(field.name, nextItems)}
      />
    </div>
  )
}
