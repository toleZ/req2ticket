import { SIDE_SELECT } from './DetailRow.styles'

/**
 * The compact select that goes inside a DetailRow. Smaller and lighter than the create modals'
 * control: it sits in a 320px column next to a label, not on a full-width form row.
 *
 * The <option>s are children for the same reason as SelectField's — the lists are not the same
 * shape, and some of them open with an empty choice.
 */
export function DetailSelect({ id, name, value, disabled = false, onChange, children }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className={SIDE_SELECT}
    >
      {children}
    </select>
  )
}
