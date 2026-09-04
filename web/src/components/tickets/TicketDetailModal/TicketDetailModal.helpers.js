export function toDetailValues(ticket) {
  return {
    title: ticket.title,
    description: ticket.description ?? '',
    epicId: String(ticket.epicId),
    priority: ticket.priority,
    status: ticket.status,
    points: String(ticket.points),
    assigneeId: ticket.assigneeId ? String(ticket.assigneeId) : '',
    sprintId: ticket.sprintId ? String(ticket.sprintId) : '',
  }
/* The design's blue callout. The opacity sits on the accent (`bg-blue/8`) and not on a fixed
   grey: --sys-blue changes by itself in dark mode, so the box follows without a `dark:`. */

/* The form values, all strings — which is what an <input> returns. The conversion to a number
   happens once, in lib/api/tickets.js. */

}
