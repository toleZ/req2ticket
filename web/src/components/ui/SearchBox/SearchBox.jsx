import { Search } from 'lucide-react'

import { BOX, INPUT } from './SearchBox.styles'

/**
 * A list page's search box. Controlled by the page, which keeps the text in its own state (a
 * box bound only to the URL lost letters under fast typing) and writes it to the URL.
 * Escape clears it.
 */
export function SearchBox({ value, placeholder, onChange }) {
  return (
    <label className={BOX}>
      <Search className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />
      <input
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
        className={INPUT}
      />
    </label>
  )
}
