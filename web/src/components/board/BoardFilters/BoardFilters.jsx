import { Diamond, Shapes, User } from 'lucide-react'

import { INITIAL_FILTERS, NO_EPIC, UNASSIGNED, countActiveFilters } from '@/components/board/board.helpers'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { FilterChip } from '@/components/ui/FilterChip/FilterChip'
import { Switch } from '@/components/ui/Switch/Switch'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, findOption, TICKET_TYPE_OPTIONS } from '@/lib/options'
import { CLEAR_BUTTON } from '@/components/ui/FilterBar/FilterBar.styles'

/**
 * The board's quick filters: "Solo lo mío", the type, the epic and who has it. They hold no
 * state: the page keeps `filters` ({ mine, types, epics, assignees }) and gets every change
 * through `onChange(next)`.
 */
export function BoardFilters({ filters, epics, members, onChange }) {
  const active = countActiveFilters(filters)

  const typeOptions = TICKET_TYPE_OPTIONS.map((type) => ({
    value: type.value,
    label: type.label,
    leading: <TicketTypeIcon type={type.value} className="size-4" />,
  }))

  const epicOptions = [
    { value: NO_EPIC, label: 'Sin épica' },
    ...epics.map((epic) => {
      const accent = findOption(ACCENT_COLORS, epic.accentColor)
      return {
        value: String(epic.id),
        label: epic.name,
        leading: <span className={cn('size-2 shrink-0 rounded-full', accent ? accent.dotClass : 'bg-gray')} aria-hidden="true" />,
      }
    }),
  ]

  const assigneeOptions = [
    { value: UNASSIGNED, label: 'Sin asignar' },
    ...members.map((member) => ({
      value: String(member.id),
      label: member.name,
      leading: <Avatar name={member.name} size="sm" colorKey={member.id} />,
    })),
  ]

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Switch checked={filters.mine} label="Solo lo mío" onChange={(mine) => onChange({ ...filters, mine })} />

      <FilterChip
        label="Tipo"
        icon={Shapes}
        options={typeOptions}
        value={filters.types}
        onChange={(types) => onChange({ ...filters, types })}
      />
      <FilterChip
        label="Épica"
        icon={Diamond}
        options={epicOptions}
        value={filters.epics}
        searchable
        onChange={(values) => onChange({ ...filters, epics: values })}
      />
      <FilterChip
        label="Asignado"
        icon={User}
        options={assigneeOptions}
        value={filters.assignees}
        searchable
        onChange={(assignees) => onChange({ ...filters, assignees })}
      />

      {active > 0 && (
        <button
          type="button"
          onClick={() => onChange(INITIAL_FILTERS)}
          className={CLEAR_BUTTON}
        >
          Limpiar {active === 1 ? '1 filtro' : `${active} filtros`}
        </button>
      )}
    </div>
  )
}
