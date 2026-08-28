import { ChecklistField } from '@/components/tickets/ChecklistField'
import { EXTRA_FIELDS } from '@/lib/ticketExtraFields'

const LABEL = 'mb-1 block text-subheadline font-medium text-label'

const CONTROL = `w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2
  text-body text-label disabled:opacity-50`

/**
 * Dibuja los campos extra del tipo que le pasen. Es el mismo componente para los cuatro
 * tipos: la lista de campos sale de EXTRA_FIELDS y acá solo se decide, campo por campo, qué
 * etiqueta HTML le toca. Cuatro formularios copiados serían cuatro lugares donde arreglar
 * el mismo error.
 *
 * No tiene estado propio a propósito. Quien lo usa (el modal de alta o el panel de edición)
 * es el dueño de `values` y recibe cada cambio por `onChange(name, value)`. Eso es lo que
 * permite que el mismo componente sirva en los dos lugares sin una línea distinta.
 *
 * Los bloques son `condición && <etiqueta/>` uno abajo del otro, y no un ternario anidado de
 * seis niveles: cada línea se lee sola, y agregar un `kind` es agregar un bloque.
 */
export function TicketExtraFields({ type, values, onChange, disabled, idPrefix }) {
  const fields = EXTRA_FIELDS[type] || []

  return (
    <>
      {fields.map((field) => {
        const id = `${idPrefix}-${field.name}`

        return (
          <div key={field.name}>
            <label htmlFor={id} className={LABEL}>
              {field.label} <span className="font-normal text-label-tertiary">(opcional)</span>
            </label>

            {field.kind === 'text' && (
              <input
                id={id}
                type="text"
                value={values[field.name]}
                disabled={disabled}
                onChange={(e) => onChange(field.name, e.target.value)}
                className={CONTROL}
              />
            )}

            {field.kind === 'textarea' && (
              <textarea
                id={id}
                rows={3}
                value={values[field.name]}
                disabled={disabled}
                onChange={(e) => onChange(field.name, e.target.value)}
                className={`${CONTROL} resize-none`}
              />
            )}

            {field.kind === 'select' && (
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
            )}

            {field.kind === 'checklist' && (
              <ChecklistField
                id={id}
                items={values[field.name]}
                disabled={disabled}
                onItemsChange={(nextItems) => onChange(field.name, nextItems)}
              />
            )}
          </div>
        )
      })}
    </>
  )
}
