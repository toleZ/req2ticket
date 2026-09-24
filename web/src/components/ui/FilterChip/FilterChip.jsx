/* No hace falta leer esto para usar FilterChip: give it a `label`, the `options` and the
   `value` (an array, or a single string with `multiple={false}`), and it calls `onChange`
   with the new value.

   Inside it is a disclosure: the chip opens a small panel of native checkboxes (radios when
   single), with a search box when `searchable`. Escape closes it and returns to the chip
   without closing anything around it; focus or a click leaving the panel closes it too. An
   active chip shows its value (or how many) and an × that clears just this filter. */
import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

import { cn } from '@/lib/cn'

/* Filled, never outlined — the same surface as the app's neutral buttons. An active chip
   takes the blue tint every "on" state uses (the active nav item, a pressed toggle). */
const CHIP = `inline-flex min-h-11 items-stretch rounded-control text-footnote transition-colors
  duration-fast ease-out-quad lg:min-h-8`

const CHIP_IDLE = 'bg-fill-tertiary text-label hover:bg-fill-secondary'

const CHIP_ACTIVE = 'bg-blue/12 text-blue-text'

const CHIP_MAIN = 'flex items-center gap-1.5 px-2.5 font-medium'

const CHIP_CLEAR = `grid w-9 place-items-center rounded-r-control transition-colors duration-fast
  hover:bg-blue/12 lg:w-7`

const COUNT = `grid h-4.5 min-w-4.5 place-items-center rounded-[5px] bg-blue px-1 text-caption2
  font-semibold text-white`

const PANEL = `absolute top-full z-30 mt-1 w-64 origin-top animate-pop-in rounded-control bg-elevated p-1
  shadow-popover ring-[0.5px] ring-separator`

const INNER = 'rounded-[calc(var(--radius-control)-0.25rem)]'

const OPTION = `flex min-h-11 cursor-pointer items-center gap-2.5 px-2.5 text-footnote text-label
  hover:bg-fill-tertiary has-focus-visible:bg-fill-tertiary lg:min-h-8`

function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function FilterChip({
  label,
  icon: Icon,
  options,
  value,
  multiple = true,
  searchable = false,
  align = 'start',
  onChange,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  /* While the panel is open the chip keeps its own copy of the ticked values, updated on the
     click itself: the value comes back through the URL a moment later, and a checkbox bound
     only to that would flash back for a frame. Closing drops the copy. */
  const [draft, setDraft] = useState(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const panelId = useId()

  const current = multiple ? (draft ?? value) : value
  const selected = multiple ? current : [current]
  const active = multiple && value.length > 0
  const matches = options.filter((option) => normalize(option.label).includes(normalize(query)))
  const first = options.find((option) => option.value === selected[0])

  useEffect(() => {
    if (open) panelRef.current?.querySelector('input')?.focus()
  }, [open])

  function toggle(optionValue) {
    if (!multiple) {
      onChange(optionValue)
      close()
      return
    }
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue]
    setDraft(next)
    onChange(next)
  }

  function close() {
    setOpen(false)
    setDraft(null)
    triggerRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpen(false)
      setDraft(null)
    }
  }

  let summary = label
  if (!multiple && first) summary = `${label} · ${first.label}`
  if (active && value.length === 1 && first) summary = first.label

  return (
    <div className="relative" onBlur={handleBlur} onKeyDown={open ? handleKeyDown : undefined}>
      <div className={cn(CHIP, active ? CHIP_ACTIVE : CHIP_IDLE)}>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={active ? `${label}: ${value.length} ${value.length === 1 ? 'seleccionado' : 'seleccionados'}` : undefined}
          onClick={() => {
            setQuery('')
            setDraft(null)
            setOpen(!open)
          }}
          className={CHIP_MAIN}
        >
          {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
          {active && value.length === 1 && first?.leading}
          <span className="max-w-40 truncate">{summary}</span>
          {active && value.length > 1 && <span className={COUNT}>{value.length}</span>}
          {!active && (
            <ChevronDown
              className={cn('size-3.5 shrink-0 transition-[rotate] duration-fast', open && 'rotate-180')}
              aria-hidden="true"
            />
          )}
        </button>
        {active && (
          <button
            type="button"
            aria-label={`Quitar el filtro ${label}`}
            onClick={() => onChange([])}
            className={CHIP_CLEAR}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div ref={panelRef} id={panelId} className={cn(PANEL, align === 'end' ? 'right-0' : 'left-0')}>
          {searchable && (
            <div className={cn('mb-1 flex min-h-11 items-center gap-2 bg-fill-tertiary px-2.5 lg:min-h-8', INNER)}>
              <Search className="size-3.5 shrink-0 text-label-secondary" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Buscar ${label.toLowerCase()}`}
                aria-label={`Buscar ${label.toLowerCase()}`}
                className="min-w-0 flex-1 self-stretch bg-transparent text-footnote text-label placeholder:text-label-tertiary focus:outline-none"
              />
            </div>
          )}

          {/* No mousedown focus change: pressing on a row's text would otherwise move focus
              out of the panel, which reads as "clicked outside" and closes it before the click
              lands. The click still reaches the checkbox, so the whole row toggles it. */}
          <fieldset className="max-h-64 overflow-y-auto" onMouseDown={(e) => e.preventDefault()}>
            <legend className="sr-only">{label}</legend>
            {matches.map((option) => (
              <label key={option.value} className={cn(OPTION, INNER)}>
                <input
                  type={multiple ? 'checkbox' : 'radio'}
                  name={panelId}
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                  className="size-4 shrink-0 accent-blue"
                />
                {option.leading}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.hint && <span className="shrink-0 text-caption text-label-secondary">{option.hint}</span>}
              </label>
            ))}
            {matches.length === 0 && (
              <p className="px-2.5 py-2 text-footnote text-label-secondary">Nada coincide</p>
            )}
          </fieldset>
        </div>
      )}
    </div>
  )
}
