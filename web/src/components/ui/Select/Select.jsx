/* No hace falta leer esto para usar Select: it takes `options`, `value` and `onChange` like a
   <select>, and each option can carry a `leading` element (a colour dot, an avatar), a `hint`
   on the right and `disabled: true` (shown but not pickable). It is the app's only dropdown:
   there are no native <select>s.

   - `searchable` (default false) puts a search box on top of the list. Turn it on for long
     lists (epics, sprints, people), the same prop and default as FilterChip's.
   - `variant` is `sheet` (default), the compact control of the create sheets and the detail
     side columns, or `field`, the taller grey control of a full-width form row (TextField's look).

   Inside: the trigger opens a panel with the options (and the search box). Each option is a
   plain <button>, so a click or Tab + Enter picks it. Escape closes the panel (without closing
   the modal around it), and so does focus or a click leaving it. The panel floats over what is
   below it instead of pushing it down, and opens upwards when the scrolling column it lives in
   has more room above the button than below. */
import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { cn } from '@/lib/cn'
import { PANEL_HEIGHT } from './Select.data'
import { normalize, scrollParent } from './Select.helpers'
import {
  INNER_RADIUS,
  LIST,
  OPTION,
  OPTION_DESCRIPTION,
  OPTION_DISABLED,
  OPTION_TWO_LINES,
  PANEL,
  SEARCH_INPUT,
  SEARCH_ROW,
  TRIGGER,
  TRIGGER_FIELD,
} from './Select.styles'

export function Select({
  id,
  value,
  options,
  placeholder,
  searchLabel,
  noResults,
  searchable = false,
  variant = 'sheet',
  disabled = false,
  readOnly = false,
  error,
  onChange,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [openUp, setOpenUp] = useState(false)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  const selected = options.find((option) => option.value === value)
  const matches = searchable
    ? options.filter((option) => normalize(option.label).includes(normalize(query)))
    : options

  // Inside a scrolling column, bring the whole panel into view when it opens.
  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open])

  function openPanel() {
    const box = scrollParent(triggerRef.current).getBoundingClientRect()
    const trigger = triggerRef.current.getBoundingClientRect()
    const below = Math.min(box.bottom, window.innerHeight) - trigger.bottom
    const above = trigger.top - Math.max(box.top, 0)
    setOpenUp(below < PANEL_HEIGHT && above > below)
    setQuery('')
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

  // Escape closes only the panel: stopPropagation keeps the modal around it open.
  function handleKeyDown(e) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      closePanel()
    }
  }

  // Enter in the search box picks the first match. Without this it would submit the form around.
  function handleSearchKeyDown(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const first = matches.find((option) => !option.disabled)
    if (first) pick(first)
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  /* Without the permission to change it, the value is text, not a disabled control (AUTH-1). */
  if (readOnly) {
    return (
      <ReadOnlyValue id={id} variant={variant}>
        {selected && (
          <>
            {selected.leading}
            <span className="min-w-0 truncate">{selected.label}</span>
          </>
        )}
      </ReadOnlyValue>
    )
  }

  return (
    <div className="relative" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={variant === 'field' ? TRIGGER_FIELD : TRIGGER}
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
          {searchable && (
            <div className={cn(SEARCH_ROW, INNER_RADIUS)}>
              <Search className="size-3.5 shrink-0 text-label-secondary" aria-hidden="true" />
              <input
                autoFocus
                type="text"
                placeholder={searchLabel}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className={SEARCH_INPUT}
              />
            </div>
          )}

          {/* preventDefault on mouse down: the click must not move the focus first, or the
              panel would close (handleBlur) before the option gets its click. */}
          <div onMouseDown={(e) => e.preventDefault()} className={cn(LIST, searchable && 'mt-1')}>
            {matches.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => pick(option)}
                className={cn(
                  OPTION,
                  INNER_RADIUS,
                  option.description && OPTION_TWO_LINES,
                  option.disabled && (option.description ? 'cursor-not-allowed' : OPTION_DISABLED),
                )}
              >
                {option.leading}
                {/* `description` is a second line under the label: what a role allows, or why
                    a disabled option is off ("Tiene 2 hijos abiertos"). A disabled option with a
                    reason fades only its label, so the reason itself stays readable. */}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate',
                      option.value === value && 'font-medium',
                      option.disabled && option.description && 'text-label-tertiary',
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && <span className={OPTION_DESCRIPTION}>{option.description}</span>}
                </span>
                {option.hint && (
                  <span className="shrink-0 text-caption text-label-secondary">{option.hint}</span>
                )}
                {option.value === value && (
                  <Check className="size-3.5 shrink-0 text-blue" aria-hidden="true" />
                )}
              </button>
            ))}
            {matches.length === 0 && <p className="px-2 py-2 text-footnote text-label-secondary">{noResults}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
