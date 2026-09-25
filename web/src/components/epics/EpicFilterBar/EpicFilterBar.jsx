import { ListFilter } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar/Avatar'
import { FilterBar } from '@/components/ui/FilterBar/FilterBar'
import { NONE, SORT_OPTIONS } from '@/lib/epicFilters'
import { EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { withDot } from './EpicFilterBar.helpers'

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
