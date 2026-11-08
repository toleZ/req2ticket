/* The stagger for rows revealed together ("Mostrar más", unfolding a section): each row starts
   STEP ms after the one above it, and no row waits more than CAP — a full page of 25 still
   settles in about half a second instead of making you wait for the last one.

   `from` is the index of the first new row, or null when nothing is being revealed (the rows
   shown on page load stay still). Returns what a row spreads onto itself: the class and its
   delay, or nothing. */
const STEP = 18
const CAP = 300

export function revealProps(index, from) {
  if (from === null || index < from) return {}
  return {
    className: 'animate-reveal',
    style: { animationDelay: `${Math.min((index - from) * STEP, CAP)}ms` },
  }
}
