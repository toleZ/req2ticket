import { FIELD_ERROR, REQUIRED_NOTE, SIDE_LABEL } from './SheetField.styles'

/**
 * One field of a create sheet: its label, the control you give it, and the error below.
 *
 * `htmlFor` points the label at the control. Leave it out for a group of controls (a
 * SegmentedField, the colour swatches): the label becomes a <p>, because a <label> with no
 * single target is announced as clickable, and the group already names itself.
 */
export function SheetField({ label, htmlFor, required = false, error, children }) {
  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={SIDE_LABEL}>
          {label}
          {required && <RequiredMark />}
        </label>
      ) : (
        <p className={SIDE_LABEL}>
          {label}
          {required && <RequiredMark />}
        </p>
      )}
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className={FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  )
}

/* The red asterisk after a required label. Screen readers hear "obligatorio" instead. */
export function RequiredMark() {
  return (
    <>
      <span className="text-red-text" aria-hidden="true">
        {' *'}
      </span>
      <span className="sr-only"> (obligatorio)</span>
    </>
  )
}

/* The footer's key for the asterisks. */
export function RequiredNote() {
  return (
    <p className={REQUIRED_NOTE}>
      <span className="text-red-text" aria-hidden="true">
        *
      </span>{' '}
      Obligatorio
    </p>
  )
}
