/* Lowercase and without accents, so "epica" finds "Épica". */
export function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
