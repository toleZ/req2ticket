import { Link } from 'react-router-dom'
import { ArrowRight, CircleCheck } from 'lucide-react'

import { LINK, LINK_ARROW } from '@/components/tickets/TicketBreakdownList/TicketBreakdownList.styles'
import { cn } from '@/lib/cn'
import { ACTIONS, BADGE, CARD, ICON, LINK_CELL, TEXT, TITLE } from './TicketBreakdownDone.styles'

/**
 * What TicketBreakdown shows in place of the list once nothing is pending: a check, a title
 * that says so, one line of context and, optionally, what to do next.
 *
 * `actions` is for the buttons that make sense at that moment (a sprint's "Completar sprint"
 * and "Agregar del Backlog"); without them the panel is just the news. The Backlog link stays
 * either way, because the finished tickets are still worth opening.
 */
export function TicketBreakdownDone({ title, text, actions, backlogHref }) {
  return (
    <section className={CARD}>
      <span className={BADGE} aria-hidden="true">
        <CircleCheck className={ICON} />
      </span>

      <div className="min-w-0">
        <h3 className={TITLE}>{title}</h3>
        <p className={TEXT}>{text}</p>
        {actions && <div className={ACTIONS}>{actions}</div>}
      </div>

      <div className={cn(LINK_CELL, !actions && '@lg:self-center')}>
        <Link to={backlogHref} className={LINK}>
          Ver todos en el Backlog
          <ArrowRight className={LINK_ARROW} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
