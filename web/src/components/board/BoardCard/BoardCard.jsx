import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Badge } from '@/components/ui/Badge/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, findOption, TICKET_PRIORITY_OPTIONS } from '@/lib/options'
import { checklistProgress } from '@/lib/ticketStats'
import { CARD, CARD_LIFTED, CODE, FOOT, STRIPE, TITLE } from './BoardCard.styles'

/**
 * What a card on the board shows: the epic's colour as a stripe, the type and code, the title
 * (two lines at most), and at the foot the priority, the checklist, the points and who has it.
 *
 * Only the look: dragging, clicking and the menu are BoardDnd's. `lifted` is the copy that
 * follows the pointer while dragging; `saving` dims the card while its move is being saved.
 */
export function BoardCard({ ticket, epic, assignee, lifted = false, saving = false }) {
  const accent = epic && findOption(ACCENT_COLORS, epic.accentColor)
  const priority = findOption(TICKET_PRIORITY_OPTIONS, ticket.priority)
  const checklist = checklistProgress(ticket)

  return (
    <div className={cn(CARD, lifted && CARD_LIFTED, saving && 'opacity-60')}>
      <span className={cn(STRIPE, accent ? accent.dotClass : 'bg-gray3')} aria-hidden="true" />

      <div className="flex items-center gap-1.5 pr-7">
        <TicketTypeIcon type={ticket.type} className="size-3.5" />
        <span className={CODE}>{ticket.code}</span>
      </div>

      <p className={TITLE} title={ticket.title}>
        {ticket.title}
      </p>

      <div className={FOOT}>
        {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}

        {checklist.total > 0 && (
          <span className="flex items-center gap-1.5 text-caption text-label-secondary">
            {checklist.done}/{checklist.total}
            <ProgressBar value={checklist.done} max={checklist.total} size="sm" decorative className="w-8" />
          </span>
        )}

        <span className="ml-auto flex items-center gap-2">
          {ticket.points !== null && ticket.points !== undefined && (
            <span className="numeric text-caption text-label-secondary">{ticket.points} pts</span>
          )}
          <Avatar name={assignee?.name} size="sm" colorKey={assignee?.id} />
        </span>
      </div>
    </div>
  )
}
