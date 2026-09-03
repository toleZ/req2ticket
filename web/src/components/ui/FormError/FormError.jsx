import { FORM_ERROR } from './FormError.styles'
/**
 * The form-level error box: what the backend answered when a submit failed. Not to be confused
 * with a field's error, which sits under its own control and comes from lib/validate.js.
 *
 * `role="alert"` is what makes a screen reader read it the moment it appears, without the user
 * having to go looking for it.
 *
 * One definition so the six places that show one cannot drift apart again — the three create
 * modals used bg-red/12 while ConfirmModal and the two auth forms used bg-fill-tertiary.
 */
export function FormError({ children }) {
  return (
    <p className={FORM_ERROR} role="alert">
      {children}
    </p>
  )
}
