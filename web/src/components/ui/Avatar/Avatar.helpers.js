/* First letter of the first two words. "Ana Pérez" -> "AP", "Ana" -> "A". */
export function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
