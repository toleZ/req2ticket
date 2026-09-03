import { FIELD_ERROR, HEADING } from './InlineTitleField.styles'
/* The sheet's title, editable in place: no background and no visible edge at rest, both appear
   on hover or focus.

   It is a <textarea> and not an <input> so long text can be read in full:
   `field-sizing-content` grows the box instead of scrolling, and where it is not supported it
   stays on the `rows` line, the same as the old input.

   `font-display` by hand because index.css's rule only reaches h1–h4, and this is a field.
   The `-mx-2` offsets the `px-2` so the text lines up with what is below. */

/**
 * The big editable title at the top of a detail sheet — a ticket's title, an epic's name.
 *
 * Enter does nothing: a title carries no line breaks, and the caller's `.replace()` on submit
 * deals with any that get pasted in.
 */
export function InlineTitleField({ name, ariaLabel, value, disabled = false, onChange, error }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') e.preventDefault()
  }

  return (
    <div>
      <textarea
        rows={1}
        name={name}
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={HEADING}
      />
      {error && (
        <p className={FIELD_ERROR} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
