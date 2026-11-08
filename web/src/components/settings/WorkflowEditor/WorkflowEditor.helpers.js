import { TICKET_CANCELLED, TICKET_DONE, TICKET_STATUS_OPTIONS } from '@/lib/options'

/* A transition as one string, so a draft is a plain array of them and "is it on?" is includes(). */
export function transitionKey(from, to) {
  return `${from}>${to}`
}

export function toKeys(transitions) {
  return transitions.map((t) => transitionKey(t.from, t.to))
}

export function toTransitions(keys) {
  return keys.map((key) => {
    const [from, to] = key.split('>')
    return { from, to }
  })
}

/* The statuses that need a way out: every one except done and cancelled. */
const NON_TERMINAL = TICKET_STATUS_OPTIONS.filter(
  (option) => option.value !== TICKET_DONE && option.value !== TICKET_CANCELLED,
)

/* What the API would refuse, said before saving (ENT-3): a status nothing leaves from would trap
   every ticket that reaches it. Returns { status: 'En revisión no tiene salida' }. */
export function deadEnds(keys) {
  const problems = {}
  NON_TERMINAL.forEach((option) => {
    if (!keys.some((key) => key.startsWith(`${option.value}>`))) {
      problems[option.value] = `${option.label} no tiene salida`
    }
  })
  return problems
}

/* Same set of transitions, whatever the order: used to know whether there is anything to save. */
export function sameKeys(a, b) {
  return a.length === b.length && a.every((key) => b.includes(key))
}
