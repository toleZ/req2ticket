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
/* `reserveError` keeps the error line's space even while there is no error, so a form that
   shows its messages on submit does not grow and jump under the pointer. */
export function Field({ id, label, optional = false, error, reserveError = false, children }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label} {optional && <span className={OPTIONAL}>(opcional)</span>}
      </label>
      {children}
      {(error || reserveError) && (
        <p id={`${id}-error`} className={reserveError ? `${FIELD_ERROR} min-h-[1lh]` : FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  )
}
