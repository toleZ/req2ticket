/* The active sprint's time badge. Past its end date it says so, in orange, instead of
   disappearing: an overdue sprint is exactly the one the team needs to notice. */
export function remainingLabel(daysLeft) {
  if (daysLeft === 0) return 'Termina hoy'
  if (daysLeft === 1) return 'Queda 1 día'
  if (daysLeft > 1) return `Quedan ${daysLeft} días`
  return daysLeft === -1 ? 'Vencido hace 1 día' : `Vencido hace ${-daysLeft} días`
}
