import { Badge } from '@/components/ui/Badge'
import { findOption } from '@/lib/options'
import { STORY_STATUS_OPTIONS } from '@/lib/storyOptions'

/* Compact, read-only listing of what a sprint or an epic contains. */
export function StorySummaryList({ stories }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {stories.map((story) => {
        const status = findOption(STORY_STATUS_OPTIONS, story.status)

        return (
          <li key={story.id} className="flex items-center gap-2">
            <span className="shrink-0 text-caption text-label-tertiary">{story.code}</span>
            <span className="min-w-0 flex-1 truncate text-footnote text-label">{story.title}</span>
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
            <span className="shrink-0 text-caption font-medium text-label-secondary">
              {story.points} pts
            </span>
          </li>
        )
      })}
    </ul>
  )
}
