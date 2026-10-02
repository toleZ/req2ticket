/* Same order as TONE_CLASSES in Avatar.styles.js. Red is left out: next to a person it would
   read as an error. */
const TONES = ['orange', 'blue', 'green', 'purple', 'yellow', 'pink', 'teal', 'indigo']

/* The id picks the colour, not the name, so renaming someone does not repaint them. */
export function toneFromId(id) {
  return TONES[Math.abs(Number(id) || 0) % TONES.length]
}

/* First letter of the first two words. "Ana Pérez" -> "AP", "Ana" -> "A". */
export function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
