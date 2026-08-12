import { FileText } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { findOption } from '@/lib/epicOptions'
import { STORY_PRIORITY_OPTIONS } from '@/lib/storyOptions'

export function StoryRow({ story, epicName }) {
  const priority = findOption(STORY_PRIORITY_OPTIONS, story.priority)

  return (
    <li className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-control px-2.5 py-2 transition-colors duration-fast hover:bg-fill-tertiary">
      <FileText className="size-4 shrink-0 text-label-tertiary" aria-hidden="true" />

      <span className="shrink-0 text-caption text-label-tertiary">{story.code}</span>

      <span className="min-w-0 flex-1 truncate text-subheadline text-label">{story.title}</span>

      <Badge tone="neutral">{epicName}</Badge>

      <span className="flex shrink-0 items-center gap-1.5">
        <span className="text-caption text-label-tertiary">
          {story.criteriaDone}/{story.criteriaTotal} criterios
        </span>
        <ProgressBar value={story.criteriaDone} max={story.criteriaTotal} size="sm" className="w-14" />
      </span>

      {priority && <Badge tone={priority.tone}>{priority.label}</Badge>}

      <span className="shrink-0 text-caption font-medium text-label-secondary">{story.points} pts</span>

      <Avatar name={story.assigneeName} size="sm" />
    </li>
  )
}
