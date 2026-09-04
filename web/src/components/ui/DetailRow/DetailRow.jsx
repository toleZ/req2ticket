import { DETAIL_LABEL, DETAIL_ROW, DETAIL_VALUE } from './DetailRow.styles'

/**
 * A "label → value" row in a detail sheet's side column.
 *
 * The label is a <label> only when `htmlFor` is given, and a <span> otherwise. That is not a
 * nicety: a <label> with no target is announced as clickable, and the ticket's type row has
 * nothing to point at because the type cannot be edited.
 */
export function DetailRow({ label, htmlFor, children }) {
  return (
    <div className={DETAIL_ROW}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={DETAIL_LABEL}>
          {label}
        </label>
      ) : (
        <span className={DETAIL_LABEL}>{label}</span>
      )}
      <div className={DETAIL_VALUE}>{children}</div>
    </div>
  )
}
