import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'

import { cn } from '@/lib/cn'

const ITEM = `group flex items-center gap-2.5 rounded-control px-1.5 py-1.5 transition-colors
  duration-fast hover:bg-fill-quaternary`

/* El círculo que se ve. El <input> de verdad está al lado, en sr-only: sigue siendo un
   checkbox nativo (espacio lo tilda, el lector de pantalla lo anuncia como casilla) pero no
   se dibuja, porque un checkbox nativo no se puede redondear ni pintar de azul.

   `peer-focus-visible` es lo que devuelve el anillo de foco que sr-only se llevó: el <span>
   es hermano del input y va después, que es justo lo que la variante peer necesita. */
const CIRCLE = `grid size-4.5 shrink-0 place-items-center rounded-full border border-separator-opaque
  text-white transition-colors duration-fast
  peer-focus-visible:ring-3 peer-focus-visible:ring-blue/55 peer-disabled:opacity-50`

const REMOVE_BUTTON = `grid size-6 shrink-0 place-items-center rounded-control text-label-tertiary
  opacity-0 transition-colors duration-fast group-hover:opacity-100 focus-visible:opacity-100
  hover:bg-red/12 hover:text-red disabled:opacity-50`

const ADD_ROW = 'flex items-center gap-2.5 rounded-control px-1.5 py-1.5'

const ADD_BUTTON = `grid size-4.5 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast hover:bg-fill-tertiary hover:text-label disabled:opacity-50`

/* Sin borde ni fondo: la fila de agregar tiene que leerse como una línea más de la lista, no
   como un formulario pegado abajo. */
const ADD_INPUT = `min-w-0 flex-1 border-0 bg-transparent p-0 text-footnote text-label
  placeholder:text-label-tertiary focus:outline-none disabled:opacity-50`

/**
 * Una lista de ítems tildables: los criterios de aceptación, la DoR, la DoD, el checklist de
 * una tarea y los pasos de verificación de un fix. Todos son { text, done }.
 *
 * Los ítems viven en el estado del formulario que lo usa (llegan por `items`, salen por
 * `onItemsChange`). Lo único propio es `draft`, el texto que se está escribiendo abajo — y
 * por eso este componente existe aparte: una historia tiene tres checklists, y cada una
 * necesita su propio borrador. Tres instancias, tres `draft`, sin estado compartido.
 */
export function ChecklistField({ id, items, disabled, addLabel = 'Añadir ítem', onItemsChange }) {
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
    <div className="-mx-1.5">
      {items.length > 0 && (
        <ul className="flex flex-col">
          {/* key por índice: los ítems no tienen id y la lista solo cambia por alta y baja.
              El día que se puedan reordenar, esto necesita un id de verdad. */}
          {items.map((item, index) => (
            <li key={index} className={ITEM}>
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={item.done}
                  disabled={disabled}
                  onChange={() => handleToggle(index)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(CIRCLE, item.done && 'border-blue bg-blue')}
                >
                  {item.done && <Check className="size-3" strokeWidth={3.5} />}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 text-footnote',
                    item.done ? 'text-label-tertiary line-through' : 'text-label',
                  )}
                >
                  {item.text}
                </span>
              </label>

              {/* Aparece al pasar el mouse por la fila (group-hover) para no llenar la lista
                  de cruces. focus-visible lo trae de vuelta para quien navega con Tab. */}
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

      <div className={ADD_ROW}>
        {/* El "+" es un botón de verdad y no un adorno: con Enter alcanza para el teclado,
            pero quien escribe y agarra el mouse necesita algo donde hacer clic. */}
        <button
          type="button"
          aria-label={addLabel}
          onClick={handleAdd}
          disabled={disabled}
          className={ADD_BUTTON}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
        <input
          id={id}
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={addLabel}
          aria-label={addLabel}
          className={ADD_INPUT}
        />
      </div>
    </div>
  )
}
