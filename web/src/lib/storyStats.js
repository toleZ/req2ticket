import { STORY_DONE } from '@/lib/storyOptions'

/* Summary of a set of stories. The sprint card and the epic row share it: both show the
   same numbers over different slices of the backlog. */

export function summarizeStories(stories) {
  const done = stories.filter((story) => story.status === STORY_DONE)

  return {
    total: stories.length,
    completed: done.length,
    points: stories.reduce((sum, story) => sum + story.points, 0),
    pointsCompleted: done.reduce((sum, story) => sum + story.points, 0),
  }
}
