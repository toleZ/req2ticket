import { EpicRow } from '@/components/epics/EpicRow'

/**
 * The epic list.
 *
 * `stories` is every story in the project, not one epic's worth: the page fetches them
 * once and each row gets its own already-filtered slice. Doing the filtering here rather
 * than on the page keeps the expression out of the page's JSX, where it read as noise.
 */
export function EpicList({ epics, stories, onUpdateEpic, onDeleteEpic }) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {epics.map((epic) => (
        <EpicRow
          key={epic.id}
          epic={epic}
          stories={stories.filter((story) => story.epicId === epic.id)}
          onUpdateEpic={onUpdateEpic}
          onDeleteEpic={onDeleteEpic}
        />
      ))}
    </ul>
  )
}
