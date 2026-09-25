/* No hace falta leer esto para usar TicketPointsField: it only adds the arrow keys.

   A radio group is one stop in the Tab order, and the arrows move the choice inside it — the
   way the native <input type="radio"> behaves. Tab reaches the chip that is on (the others
   carry tabIndex -1), and each arrow picks the next point AND moves the focus to it, since a
   radio's focus and its selection travel together. The ends wrap around. */
const STEPS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

export function handlePointsKeyDown(event, scale, current, onChange) {
  let next

  if (event.key in STEPS) {
    const index = scale.indexOf(current)
    next = scale[(index + STEPS[event.key] + scale.length) % scale.length]
  } else if (event.key === 'Home') {
    next = scale[0]
  } else if (event.key === 'End') {
    next = scale[scale.length - 1]
  } else {
    return
  }

  event.preventDefault()
  onChange(String(next))
  event.currentTarget.querySelector(`[data-point="${next}"]`)?.focus()
}
