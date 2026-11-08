// The nearest ancestor that scrolls: the room the panel has is measured inside it.
export function scrollParent(element) {
  let parent = element.parentElement
  while (parent && !/auto|scroll/.test(getComputedStyle(parent).overflowY)) parent = parent.parentElement
  return parent || document.documentElement
}

/* Lowercase and without accents, so "epica" finds "Épica". */
export function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
