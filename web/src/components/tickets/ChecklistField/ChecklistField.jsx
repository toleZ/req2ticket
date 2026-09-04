import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { ADD_BUTTON, ADD_INPUT, ADD_ROW, CIRCLE, ITEM, REMOVE_BUTTON } from './ChecklistField.styles'

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
export function ChecklistField({ id, items, disabled, addLabel = 'Añadir ítem', onItemsChange }) {
  const [draft, setDraft] = useState('')

  function handleAdd() {
    const text = draft.trim()
    if (!text) return

    onItemsChange([...items, { text, done: false }])
    setDraft('')
  }

  /* `.map` and `.filter` return new arrays instead of touching the one already in state. It
     is not a preference: React compares by identity, so handing it back the same array,
     modified, would redraw nothing. */
  function handleToggle(index) {
    onItemsChange(items.map((item, i) => (i === index ? { ...item, done: !item.done } : item)))
  }

  function handleRemove(index) {
    onItemsChange(items.filter((item, i) => i !== index))
  }

  /* Enter adds the item. The preventDefault is not optional: inside a <form>, Enter in an
     input fires the submit, so without this adding a criterion would create the ticket. */
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    handleAdd()
  }

  return (
    <div className="-mx-1.5">
      {items.length > 0 && (
        <ul className="flex flex-col">
          {/* key by index: the items have no id and the list only changes by adding and
              removing. The day they can be reordered, this needs a real id. */}
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
