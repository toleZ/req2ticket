import { useState } from 'react'
import { Plus, X } from 'lucide-react'

const INPUT = `w-full rounded-control border border-separator bg-fill-tertiary px-3 py-2
  text-body text-label disabled:opacity-50`

const ADD_BUTTON = `grid size-9 shrink-0 place-items-center rounded-control bg-fill-tertiary
  text-label-secondary transition-colors duration-fast hover:bg-fill-secondary hover:text-label
  disabled:opacity-50`

const REMOVE_BUTTON = `grid size-6 shrink-0 place-items-center rounded-control
  text-label-tertiary transition-colors duration-fast hover:bg-red/12 hover:text-red
  disabled:opacity-50`

/**
 * Una lista de ítems tildables: los criterios de aceptación, la DoR, la DoD, el checklist de
 * una tarea y los pasos de verificación de un fix. Todos son { text, done }.
 *
 * Los ítems viven en el estado del formulario que lo usa (llegan por `items`, salen por
 * `onItemsChange`). Lo único propio es `draft`, el texto que se está escribiendo abajo — y
 * por eso este componente existe aparte: una historia tiene tres checklists, y cada una
 * necesita su propio borrador. Tres instancias, tres `draft`, sin estado compartido.
 */
export function ChecklistField({ id, items, disabled, onItemsChange }) {
  const [draft, setDraft] = useState('')

  function handleAdd() {
    const text = draft.trim()
    if (!text) return

    onItemsChange([...items, { text, done: false }])
    setDraft('')
  }

  /* `.map` y `.filter` devuelven arrays nuevos en vez de tocar el que ya está en el estado.
     No es preferencia: React compara por identidad, así que si le devolvieras el mismo array
     modificado no volvería a dibujar nada. */
  function handleToggle(index) {
    onItemsChange(items.map((item, i) => (i === index ? { ...item, done: !item.done } : item)))
  }

  function handleRemove(index) {
    onItemsChange(items.filter((item, i) => i !== index))
  }

  /* Enter agrega el ítem. El preventDefault no es opcional: dentro de un <form>, Enter en un
     input dispara el submit, así que sin esto cargar un criterio crearía el ticket. */
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    handleAdd()
  }

  return (
    <div>
      {items.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1">
          {/* key por índice: los ítems no tienen id y la lista solo cambia por alta y baja.
              El día que se puedan reordenar, esto necesita un id de verdad. */}
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.done}
                disabled={disabled}
                onChange={() => handleToggle(index)}
                aria-label={item.text}
                className="size-4 shrink-0"
              />
              <span
                className={
                  item.done
                    ? 'min-w-0 flex-1 text-footnote text-label-tertiary line-through'
                    : 'min-w-0 flex-1 text-footnote text-label'
                }
              >
                {item.text}
              </span>
              <button
                type="button"
                aria-label={`Quitar "${item.text}"`}
                disabled={disabled}
                onClick={() => handleRemove(index)}
                className={REMOVE_BUTTON}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Agregar ítem y Enter"
          className={INPUT}
        />
        {/* type="button": si no, este botón también manda el formulario. */}
        <button type="button" onClick={handleAdd} disabled={disabled} className={ADD_BUTTON}>
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
