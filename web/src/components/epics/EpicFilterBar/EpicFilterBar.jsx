import { ListFilter } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar/Avatar'
import { FilterBar } from '@/components/ui/FilterBar/FilterBar'
import { cn } from '@/lib/cn'
import { NONE, SORT_OPTIONS } from '@/lib/epicFilters'
import { EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'

/* Tones to solid dots, written out in full for Tailwind. */
const DOT = {
  neutral: 'bg-gray3',
  gray: 'bg-gray',
  blue: 'bg-blue',
  green: 'bg-green',
  yellow: 'bg-yellow',
  orange: 'bg-orange',
  red: 'bg-red',
}

const withDot = (options) =>
  options.map((option) => ({
    value: option.value,
    label: option.label,
    leading: <span className={cn('size-2 shrink-0 rounded-full', DOT[option.tone])} aria-hidden="true" />,
  }))

/**
 * The Épicas page's chips for FilterBar (components/ui/FilterBar), the same row the Backlog
 * uses. The page reads and writes the filters in the URL (lib/epicFilters.js).
 */
export function EpicFilterBar({ filters, activeCount, users, onListChange, onMineChange, onSortChange, onClear }) {
  const chips = [
    { key: 'status', label: 'Estado', icon: ListFilter, options: withDot(EPIC_STATUS_OPTIONS) },
    { key: 'priority', label: 'Prioridad', options: withDot(EPIC_PRIORITY_OPTIONS) },
    {
      key: 'owner',
      label: 'Responsable',
      searchable: true,
      options: [
        { value: NONE, label: 'Sin responsable' },
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
      mine={{ label: 'Solo las mías', checked: filters.mine, onChange: onMineChange }}
    />
  )
}
