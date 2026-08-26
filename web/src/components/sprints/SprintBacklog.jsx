import { StorySummaryList } from '@/components/stories/StorySummaryList'
import { Badge } from '@/components/ui/Badge'

/**
 * The Backlog block at the foot of the Sprints page: the stories nobody has put in a
 * sprint yet.
 *
 * Read-only on purpose — a story is assigned to a sprint from its own panel, in Historias.
 * The heading and the count stay visible even with nothing in the backlog, so an empty
 * backlog reads as "none left" rather than as a section that failed to load.
 */
export function SprintBacklog({ stories }) {
  return (
    <div className="mt-6 border-t border-separator pt-4">
      <div className="flex items-center gap-2">
        <h2 className="text-headline text-label">Backlog</h2>
        <Badge tone="neutral">{stories.length}</Badge>
      </div>
      <p className="mt-1 max-w-prose text-footnote text-label-secondary">
        Historias sin sprint asignado. Se asignan desde el panel de cada historia, en Historias.
      </p>

      {stories.length > 0 && (
        <div className="mt-3">
          <StorySummaryList stories={stories} />
        </div>
      )}
    </div>
  )
}
