import { Avatar } from '@/components/ui/Avatar/Avatar'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, findOption, SPRINT_STATUS_OPTIONS } from '@/lib/options'

/* The option lists for SearchSelect, shared by the create modals and the detail sheets so an
   epic, a sprint or a person looks the same in every picker. The values are strings, like a
   <select>'s, because that is what the forms keep. */

// Epics carry their accent colour as a dot. No empty option: a ticket always has an epic.
export function epicPickerOptions(epics) {
  return epics.map((epic) => {
    const accent = findOption(ACCENT_COLORS, epic.accentColor)
    return {
      value: String(epic.id),
      label: epic.name,
      leading: (
        <span
          className={cn('size-2 shrink-0 rounded-full', accent ? accent.dotClass : 'bg-gray')}
          aria-hidden="true"
        />
      ),
    }
  })
}

// Sprints show their status on the right, so a closed one is not picked by mistake.
export function sprintPickerOptions(sprints, emptyLabel) {
  return [
    { value: '', label: emptyLabel },
    ...sprints.map((sprint) => ({
      value: String(sprint.id),
      label: sprint.name,
      hint: findOption(SPRINT_STATUS_OPTIONS, sprint.status)?.label,
    })),
  ]
}

// People carry their initials.
export function userPickerOptions(users, emptyLabel) {
  return [
    { value: '', label: emptyLabel },
    ...users.map((user) => ({
      value: String(user.id),
      label: user.name,
      leading: <Avatar name={user.name} size="sm" />,
    })),
  ]
}
