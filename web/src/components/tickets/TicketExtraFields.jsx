import { ChecklistField } from '@/components/tickets/ChecklistField'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EXTRA_FIELDS } from '@/lib/ticketExtraFields'

const CHECKLIST_LABEL = 'text-subheadline font-medium text-label'

const LABEL = 'mb-1 block text-subheadline font-medium text-label'

const OPTIONAL = 'font-normal text-label-tertiary'

const CONTROL = `w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2
  text-body text-label transition-colors duration-fast placeholder:text-label-tertiary
  hover:border-separator-opaque disabled:opacity-50`

const CONTROL_TEXTAREA = `${CONTROL} resize-none`

/**
 * Dibuja los campos extra del tipo que le pasen. Es el mismo componente para los cuatro
 * tipos: la lista de campos sale de EXTRA_FIELDS y acá solo se decide, campo por campo, qué
 * etiqueta HTML le toca. Cuatro formularios copiados serían cuatro lugares donde arreglar
 * el mismo error.
 *
 * No tiene estado propio a propósito. Quien lo usa (el modal de alta o el de detalle) es el
 * dueño de `values` y recibe cada cambio por `onChange(name, value)`. Eso es lo que permite
 * que el mismo componente sirva en los dos lugares sin una línea distinta.
 *
 * `kinds` limita qué se dibuja. El modal de detalle lo usa para quedarse con los campos de
 * texto y los checklists y dejar los `select` (la severidad de un bug, el riesgo de un fix)
 * para la columna de la derecha, al lado de Prioridad — que es donde se leen mejor. Sin la
 * prop se dibujan todos, que es lo que quiere el modal de alta.
 *
 * `optional` decide si los campos llevan el "(opcional)" gris. En el alta sí (todo campo
 * extra se puede dejar vacío); en el detalle no, porque "Criterios de aceptación (opcional)"
 * en una ficha se lee como si no importaran.
 *
 * Ninguno se valida, así que ninguno lleva el <p> del error ni sus aria.
 *
 * Los bloques son `condición && <etiqueta/>` uno abajo del otro, y no un ternario anidado de
 * seis niveles: cada línea se lee sola, y agregar un `kind` es agregar un bloque.
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

            {/* El checklist no lleva la etiqueta suelta: su encabezado lleva además el
                contador y la barra, y el <label> apunta al input de "agregar". */}
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

/* El encabezado de un checklist: etiqueta, "N de M" y la barra fina, como en el diseño.
   Vive en este archivo y no en ChecklistField porque ChecklistField dibuja la lista y nada
   más — se usa igual sin encabezado si algún día hace falta. */
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
