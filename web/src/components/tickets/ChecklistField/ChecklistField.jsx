import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { ADD_BUTTON, ADD_INPUT, ADD_ROW, CIRCLE, ITEM, ITEM_LABEL, REMOVE_BUTTON } from './ChecklistField.styles'

import { cn } from '@/lib/cn'

/* The circle you see. The real <input> sits next to it, in sr-only: it is still a native
   checkbox (space ticks it, a screen reader announces it as a checkbox) but it is not drawn,
   because you cannot give a native checkbox round corners or paint it blue.

   `peer-focus-visible` is what gives back the focus indicator sr-only took away: the <span> is
   the input's sibling and comes after it, which is exactly what the peer variant needs. */

/* No border and no background: the add row has to read as one more line of the list, not as
   a form stuck underneath it. */
/**
 * A list of tickable items: the acceptance criteria, the DoR, the DoD, a task's checklist and
 * a fix's verification steps. All of them are { text, done }.
 *
 * The items live in the state of the form using it (they arrive through `items`, they leave
 * through `onItemsChange`). The only thing of its own is `draft`, the text being typed at the
 * bottom — and that is why this component exists separately: a story has three checklists and
 * each needs its own draft. Three instances, three `draft`s, no shared state.
 */
/* `onToggle` is optional. When given, ticking an item goes there instead of to
   `onItemsChange`: the ticket sheet uses it to save a tick on the spot, while adding,
   editing or removing items still waits for "Guardar cambios". Without it (the create
   modal, where there is no ticket to save yet) a tick is one more change to the form. */
export function ChecklistField({
  id,
  items,
  disabled,
  addLabel = 'Añadir ítem',
  onItemsChange,
  onToggle,
}) {
  const [draft, setDraft] = useState('')
  /* The item that just arrived (it grows in) and the one on its way out (it collapses
     first, and only leaves the list when that animation ends). */
  const [added, setAdded] = useState(null)
  const [removing, setRemoving] = useState(null)

  function handleAdd() {
    const text = draft.trim()
    if (!text) return

    onItemsChange([...items, { text, done: false }])
    setAdded(items.length)
    setDraft('')
  }

  /* `.map` and `.filter` return new arrays instead of touching the one already in state. It
     is not a preference: React compares by identity, so handing it back the same array,
     modified, would redraw nothing. */
  function handleToggle(index) {
    const nextItems = items.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    if (onToggle) {
      onToggle(nextItems)
    } else {
      onItemsChange(nextItems)
    }
  }

  function handleRemove(index) {
    if (removing === null) setRemoving(index)
  }

  /* `e.target` check: the tick's own animation inside the row bubbles up here too. */
  function handleRowAnimationEnd(e, index) {
    if (e.target !== e.currentTarget) return

    if (index === removing) {
      setRemoving(null)
      onItemsChange(items.filter((item, i) => i !== index))
    } else if (index === added) {
      setAdded(null)
    }
  }

  /* Enter adds the item. The preventDefault is not optional: inside a <form>, Enter in an
     input fires the submit, so without this adding a criterion would create the ticket. */
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    handleAdd()
  }

  return (
    <div>
      {items.length > 0 && (
        <ul className="flex flex-col">
          {/* key by index: the items have no id and the list only changes by adding and
              removing. The day they can be reordered, this needs a real id. */}
          {items.map((item, index) => (
            <li
              key={index}
              onAnimationEnd={(e) => handleRowAnimationEnd(e, index)}
              className={cn(
                ITEM,
                index === added && 'animate-row-in',
                index === removing && 'animate-row-out overflow-hidden',
              )}
            >
              <label className={ITEM_LABEL}>
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
                  {item.done && <Check className="size-3 animate-tick-in" strokeWidth={3.5} />}
                </span>
                <span
                  className={cn(
                    /* Always struck through, with the line transparent until done: that
                       way the strike fades in with the colour instead of snapping on. */
                    'min-w-0 flex-1 text-footnote line-through transition-colors duration-fast',
                    item.done ? 'text-label-secondary decoration-label-secondary' : 'text-label decoration-transparent',
                  )}
                >
                  {item.text}
                </span>
              </label>

              {/* Appears when the mouse is over the row (group-hover) so the list is not full
                  of crosses. focus-visible brings it back for anyone navigating with Tab. */}
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
        {/* The "+" is a real button and not an ornament: Enter is enough for the keyboard,
            but whoever types and then reaches for the mouse needs something to click. */}
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
