/* "Sprint completado. 4 tickets movidos a Sprint 5" / "… al backlog" / just "Sprint completado."
   when nothing was open. `destinationName` is undefined for the backlog. */
export function completedToast(moved, destinationName) {
  if (moved === 0) return 'Sprint completado.'

  const tickets = moved === 1 ? '1 ticket movido' : `${moved} tickets movidos`
  return `Sprint completado. ${tickets} ${destinationName ? `a ${destinationName}` : 'al backlog'}`
}
