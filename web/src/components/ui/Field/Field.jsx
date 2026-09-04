import { FIELD_ERROR, LABEL, OPTIONAL } from './Field.styles'

/**
 * The shell every form field shares: the <label>, the optional "(opcional)", the control you
 * give it, and the error <p> underneath.
 *
 * The error's id is derived — `${id}-error` — rather than being a prop, because that is the
 * convention every field in the app already followed. The controls that wrap this one wire
 * `aria-describedby` to the same string, so the two can no longer drift apart; when they did,
 * the screen reader silently skipped the message and nothing looked broken.
 *
 * Use it directly only for a control none of its siblings covers. Otherwise reach for
 * TextField, TextAreaField or SelectField, which live next to this file and share its
 * stylesheet.
 */
export function Field({ id, label, optional = false, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label} {optional && <span className={OPTIONAL}>(opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  )
}
