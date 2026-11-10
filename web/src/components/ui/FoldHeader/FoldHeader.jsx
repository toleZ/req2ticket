import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'
import { CHEVRON, COUNT_PILL, TITLE, TOGGLE } from './FoldHeader.styles'

/**
 * The header of a group that folds: a chevron, its name and how many it holds.
 *
 *     <FoldHeader title="Por hacer" count={5} folded={folded} onToggle={toggle} />
 *
 * Tickets uses it for each status, the Backlog page for "Sprints completados". The parent keeps
 * `folded` (and remembers it, if it wants, with lib/uiPrefs) and draws the content below.
 *
 * The heading wraps the button, not the other way round, so the group stays in the page's
 * heading outline while the whole header folds it.
 */
export function FoldHeader({ title, count, folded, onToggle, as: Heading = 'h2' }) {
  return (
    <Heading>
      <button type="button" onClick={onToggle} className={TOGGLE}>
        <ChevronRight className={cn(CHEVRON, !folded && 'rotate-90')} aria-hidden="true" />
        <span className={TITLE}>{title}</span>
        <span className={COUNT_PILL}>{count}</span>
      </button>
    </Heading>
  )
}
