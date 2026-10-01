/* The active sprint's time badge. Past its end date it says so, in orange, instead of
   disappearing: an overdue sprint is exactly the one the team needs to notice. */
export function remainingLabel(daysLeft) {
  if (daysLeft === 0) return 'Termina hoy'
  if (daysLeft === 1) return 'Queda 1 día'
  if (daysLeft > 1) return `Quedan ${daysLeft} días`
  return daysLeft === -1 ? 'Vencido hace 1 día' : `Vencido hace ${-daysLeft} días`
}

/* "Agregar del Backlog": glide down to the Backlog block on this same page instead of the
   anchor's jump, so it is clear the page scrolled rather than changed. With reduced motion
   it jumps. The link keeps its href, so it still works if this never runs. */
export function scrollToBacklog(event, id) {
  const target = document.getElementById(id)
  if (!target) return

  event.preventDefault()
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: isReduced ? 'auto' : 'smooth', block: 'start' })
}
