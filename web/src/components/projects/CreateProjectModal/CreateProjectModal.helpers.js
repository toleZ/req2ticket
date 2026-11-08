export const INITIAL_VALUES = { name: '', key: '', description: '' }

/* The same rule as the API: a letter, then letters or digits, 2 to 6 in total (R2T is valid). */
const KEY_PATTERN = /^[A-Z][A-Z0-9]{1,5}$/

/* "Tienda Online" -> "TO", "Req2Ticket" -> "REQ". The initials of each word, or the first three
   letters of a single word; always a valid key or empty. */
export function suggestKey(name) {
  const words = name
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const raw = words.length > 1 ? words.map((word) => word[0]).join('') : (words[0] ?? '').slice(0, 3)
  const key = raw.toUpperCase().replace(/^[^A-Z]+/, '').slice(0, 6)

  return KEY_PATTERN.test(key) ? key : ''
}

export function validateProjectForm(values) {
  const errors = {}
  const name = values.name.trim()

  if (!name) errors.name = 'Ingresá el nombre del proyecto.'
  else if (name.length < 3 || name.length > 120) errors.name = 'El nombre tiene que tener entre 3 y 120 caracteres.'

  if (!values.key) errors.key = 'Ingresá una key.'
  else if (!KEY_PATTERN.test(values.key)) errors.key = 'De 2 a 6 caracteres: una letra y después letras o números.'

  return errors
}
