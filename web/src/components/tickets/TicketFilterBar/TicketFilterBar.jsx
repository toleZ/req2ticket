import { ArrowUpDown, ListFilter } from 'lucide-react'

import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { FilterChip } from '@/components/ui/FilterChip/FilterChip'
import { Switch } from '@/components/ui/Switch/Switch'
import { NONE, SORT_OPTIONS } from '@/lib/backlogFilters'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS } from '@/lib/epicOptions'
import { findOption } from '@/lib/options'
import { SPRINT_STATUS_OPTIONS } from '@/lib/sprintOptions'
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'

/**
 * The Backlog's filter row: one chip per filter, each holding any number of values, then a
 * link to clear them all; on the right, the order and "Solo lo mío". It holds no state — the
 * page reads and writes the filters in the URL (lib/backlogFilters.js).
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
    /* Two groups, so the order and the switch never wrap onto a line of their own: the chips
       wrap inside the left one, the right one stays on the first line. On phones it drops below. */
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <FilterChip
            key={chip.key}
            label={chip.label}
            icon={chip.icon}
            options={chip.options}
            value={filters[chip.key]}
            searchable={chip.searchable}
            onChange={(values) => onListChange(chip.key, values)}
          />
        ))}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 px-1.5 text-footnote font-medium text-blue-text hover:underline lg:min-h-8"
          >
            Limpiar {activeCount === 1 ? '1 filtro' : `${activeCount} filtros`}
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 self-end sm:self-start">
        <FilterChip
          label="Ordenar"
          icon={ArrowUpDown}
          options={SORT_OPTIONS}
          value={filters.sort}
          multiple={false}
          align="end"
          onChange={onSortChange}
        />
        <Switch checked={filters.mine} label="Solo lo mío" onChange={onMineChange} />
      </div>
    </div>
  )
}

/* Tones to solid dots, written out in full for Tailwind (see TicketTypeIcon's note on why). */
const DOT = {
  neutral: 'bg-gray3',
  gray: 'bg-gray',
  blue: 'bg-blue',
  indigo: 'bg-indigo',
  purple: 'bg-purple',
  green: 'bg-green',
  yellow: 'bg-yellow',
  orange: 'bg-orange',
  red: 'bg-red',
  struck: 'bg-gray3',
}
