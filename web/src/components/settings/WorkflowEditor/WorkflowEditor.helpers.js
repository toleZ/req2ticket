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

/* Every status a ticket can get to from `start` following the draft, walking it breadth first
   (the same walk as WorkflowService.Reachable in the API). */
function reachableFrom(keys, start) {
  const reached = new Set([start])
  const pending = [start]

  while (pending.length > 0) {
    const current = pending.shift()
    toTransitions(keys)
      .filter((transition) => transition.from === current && !reached.has(transition.to))
      .forEach((transition) => {
        reached.add(transition.to)
        pending.push(transition.to)
      })
  }

  return reached
}

/* What the API would also refuse: every status with a way out is not enough if they all lead to
   cancelled. A ticket is born in todo, so from there it has to be able to reach done. Returns
   the reason, or null. */
export function doneUnreachable(keys) {
  return reachableFrom(keys, 'todo').has(TICKET_DONE) ? null : 'Desde Por hacer no se llega a Terminado'
}

/* The statuses no ticket can ever reach: allowed, but probably a mistake, so the row says so
   without blocking the save. Returns { testing: 'Ningún ticket llega a este estado' }. */
export function unreachable(keys) {
  const reached = reachableFrom(keys, 'todo')
  const notes = {}
  TICKET_STATUS_OPTIONS.forEach((option) => {
    if (!reached.has(option.value)) notes[option.value] = 'Ningún ticket llega a este estado'
  })
  return notes
}

/* Same set of transitions, whatever the order: used to know whether there is anything to save. */
export function sameKeys(a, b) {
  return a.length === b.length && a.every((key) => b.includes(key))
}
