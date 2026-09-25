import { useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

import { BOX, INPUT, KBD } from './SearchBox.styles'

/**
 * A list page's search box. Controlled by the page, which keeps the text in its own state (a
 * box bound only to the URL lost letters under fast typing) and writes it to the URL.
 *
 * "/" jumps here from anywhere on the page unless you are already typing, and Escape clears
 * it. Use one per page: the "/" listener is global.
 */
export function SearchBox({ value, placeholder, onChange }) {
  const inputRef = useRef(null)

  useEffect(() => {
    function handleSlash(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener('keydown', handleSlash)
    return () => window.removeEventListener('keydown', handleSlash)
  }, [])

  return (
    <label className={BOX}>
      <Search className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.preventDefault()
            onChange('')
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-keyshortcuts="/"
        className={INPUT}
      />
      {!value && (
        <kbd className={KBD} aria-hidden="true">
          /
        </kbd>
      )}
    </label>
  )
}
