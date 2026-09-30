/* No hace falta leer esto para usar SearchSelect: it takes `options`, `value` and `onChange`
   like a <select>, and each option can carry a `leading` element (a colour dot, an avatar) and
   a `hint` on the right.

   Inside it is a combobox: the button opens a panel with a search box and the matching
   options. The arrows move through them, Enter picks, Escape closes (without closing the modal
   around it), and leaving the panel with Tab or a click elsewhere closes it too. The panel
   floats over what is below it instead of pushing it down, and opens upwards when the
   scrolling column it lives in has more room above the button than below. */
import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import { cn } from '@/lib/cn'
import { PANEL_HEIGHT } from './SearchSelect.data'
import { normalize, scrollParent } from './SearchSelect.helpers'
import { INNER_RADIUS, OPTION, PANEL, SEARCH_INPUT, SEARCH_ROW, TRIGGER } from './SearchSelect.styles'

export function SearchSelect({
  id,
  value,
  options,
  placeholder,
  searchLabel,
  noResults,
  disabled = false,
  error,
  onChange,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [openUp, setOpenUp] = useState(false)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const listId = useId()

  const selected = options.find((option) => option.value === value)
  const matches = options.filter((option) => normalize(option.label).includes(normalize(query)))
  const optionId = (index) => `${listId}-${index}`

  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
  })

  function openPanel() {
    const box = scrollParent(triggerRef.current).getBoundingClientRect()
    const trigger = triggerRef.current.getBoundingClientRect()
    const below = Math.min(box.bottom, window.innerHeight) - trigger.bottom
    const above = trigger.top - Math.max(box.top, 0)
    setOpenUp(below < PANEL_HEIGHT && above > below)
    setQuery('')
    setActive(Math.max(0, options.indexOf(selected)))
    setOpen(true)
  }

  function closePanel() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function pick(option) {
    onChange(option.value)
    closePanel()
  }

  function handleTriggerKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openPanel()
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(Math.min(active + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(active - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (matches[active]) pick(matches[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      closePanel()
    }
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  return (
    <div className="relative" onBlur={handleBlur}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        className={TRIGGER}
      >
        {selected ? (
          <>
            {selected.leading}
            <span className="min-w-0 flex-1 truncate">{selected.label}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-label-secondary">{placeholder}</span>
        )}
        <ChevronsUpDown className="size-3.5 shrink-0 text-label-secondary" aria-hidden="true" />
      </button>

      {open && (
        <div ref={panelRef} className={cn(PANEL, openUp ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top')}>
          <div className={cn(SEARCH_ROW, INNER_RADIUS)}>
            <Search className="size-3.5 shrink-0 text-label-secondary" aria-hidden="true" />
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={matches[active] ? optionId(active) : undefined}
              aria-label={searchLabel}
              placeholder={searchLabel}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={handleSearchKeyDown}
              className={SEARCH_INPUT}
            />
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-label={searchLabel}
            onMouseDown={(e) => e.preventDefault()}
            className="mt-1 max-h-56 overflow-y-auto"
          >
            {matches.map((option, index) => (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={option.value === value}
                onClick={() => pick(option)}
                onMouseMove={() => setActive(index)}
                className={cn(OPTION, INNER_RADIUS, index === active && 'bg-fill-tertiary')}
              >
                {option.leading}
                <span className={cn('min-w-0 flex-1 truncate', option.value === value && 'font-medium')}>
                  {option.label}
                </span>
                {option.hint && (
                  <span className="shrink-0 text-caption text-label-secondary">{option.hint}</span>
                )}
                {option.value === value && (
                  <Check className="size-3.5 shrink-0 text-blue" aria-hidden="true" />
                )}
              </li>
            ))}
            {matches.length === 0 && (
              <li className="px-2 py-2 text-footnote text-label-secondary">{noResults}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
