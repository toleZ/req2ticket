import { Plus } from 'lucide-react'

import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { SHEET_LABEL } from '@/components/ui/SheetField/SheetField.styles'
import { cn } from '@/lib/cn'
import { childrenProgress, statusOf } from './TicketDetailModal.helpers'

/* What the ticket divides into: a story's tasks and bugs, a bug's fixes. */
export function TicketChildren({ ticket }) {
  if (ticket.children.length === 0) return null

  return (
    <section>
      <div className="mb-1.5 flex items-baseline gap-2">
        <h3 className={cn(SHEET_LABEL, 'mb-0 text-label-secondary')}>Hijos</h3>
        <span className="text-caption text-label-secondary">{childrenProgress(ticket.children)}</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {ticket.children.map((child) => {
          const childStatus = statusOf(child.status)
          return (
            <li key={child.id} className="flex items-center gap-2 text-footnote">
              <TicketTypeIcon type={child.type} className="size-3.5" />
              <span className="mono shrink-0 whitespace-nowrap text-label-secondary">{child.code}</span>
              <span className="min-w-0 flex-1 truncate text-label" title={child.title}>
                {child.title}
              </span>
              {childStatus && <Badge tone={childStatus.tone}>{childStatus.label}</Badge>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* The shortcuts to create a child: "Agregar tarea" and "Reportar bug" in a story, "Crear fix" in
   a bug. Each one calls `onCreateChild` with what the new ticket already knows. */
const SHORTCUTS = {
  userStory: [
    { label: 'Agregar tarea', type: 'task' },
    { label: 'Reportar bug', type: 'bug' },
  ],
  bug: [{ label: 'Crear fix', type: 'fix' }],
}

export function ChildShortcuts({ ticket, disabled, onCreateChild }) {
  const shortcuts = SHORTCUTS[ticket.type] ?? []
  if (shortcuts.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {shortcuts.map((shortcut) => (
        <Button
          key={shortcut.type}
          variant="neutral"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onCreateChild({ type: shortcut.type, parentId: ticket.id, epicId: ticket.epicId, sprintId: ticket.sprintId })
          }
        >
          <Plus className="size-4" aria-hidden="true" />
          {shortcut.label}
        </Button>
      ))}
    </div>
  )
}
