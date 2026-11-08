import { ListFilter } from 'lucide-react'

import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { FilterBar } from '@/components/ui/FilterBar/FilterBar'
import { SORT_OPTIONS } from '@/lib/backlogFilters'
import { cn } from '@/lib/cn'
import {
  ACCENT_COLORS,
  findOption,
  SPRINT_STATUS_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
  TICKET_TYPE_OPTIONS,
} from '@/lib/options'
import { NONE } from '@/lib/urlFilters'
import { DOT } from './TicketFilterBar.styles'

/**
 * The Backlog's chips for FilterBar (components/ui/FilterBar): what each filter offers. The page
 * reads and writes the filters in the URL (lib/urlFilters.js, lib/backlogFilters.js).
 *
 * Every option shows what it means at a glance: statuses and priorities as their badge, types
 * with their icon, epics with their colour, sprints with their state, people with initials.
 */
export function TicketFilterBar({ filters, activeCount, epics, sprints, users, onListChange, onMineChange, onSortChange, onClear }) {
  const chips = [
    {
      key: 'status',
      label: 'Estado',
      icon: ListFilter,
      options: TICKET_STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        leading: <span className={cn('size-2 shrink-0 rounded-full', DOT[option.tone])} aria-hidden="true" />,
      })),
    },
    {
      key: 'type',
      label: 'Tipo',
      options: TICKET_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        leading: <TicketTypeIcon type={option.value} className="size-4" />,
      })),
    },
    {
      key: 'priority',
      label: 'Prioridad',
      options: TICKET_PRIORITY_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        leading: <span className={cn('size-2 shrink-0 rounded-full', DOT[option.tone])} aria-hidden="true" />,
      })),
    },
    {
      key: 'epic',
      label: 'Épica',
      searchable: true,
      options: epics.map((epic) => ({
        value: String(epic.id),
        label: epic.name,
        leading: (
          <span
            className={cn('size-2 shrink-0 rounded-full', findOption(ACCENT_COLORS, epic.accentColor)?.dotClass ?? 'bg-gray')}
            aria-hidden="true"
          />
        ),
      })),
    },
    {
      key: 'sprint',
      label: 'Sprint',
      searchable: sprints.length > 6,
      options: [
        { value: NONE, label: 'Sin sprint' },
        ...sprints.map((sprint) => ({
          value: String(sprint.id),
          label: sprint.name,
          hint: findOption(SPRINT_STATUS_OPTIONS, sprint.status)?.label,
        })),
      ],
    },
    {
      key: 'assignee',
      label: 'Responsable',
      searchable: true,
      options: [
        { value: NONE, label: 'Sin asignar' },
        ...users.map((user) => ({
          value: String(user.id),
          label: user.name,
          leading: <Avatar name={user.name} size="sm" />,
        })),
      ],
    },
  ]

  return (
    <FilterBar
      chips={chips}
      filters={filters}
      activeCount={activeCount}
      onListChange={onListChange}
      onClear={onClear}
      sort={{ options: SORT_OPTIONS, value: filters.sort, onChange: onSortChange }}
      mine={{ label: 'Solo lo mío', checked: filters.mine, onChange: onMineChange }}
    />
  )
}
