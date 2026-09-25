import { ArrowUpDown } from 'lucide-react'

import { FilterChip } from '@/components/ui/FilterChip/FilterChip'
import { Switch } from '@/components/ui/Switch/Switch'

/**
 * A list page's filter row: one multi-select chip per filter and a link to clear them all on
 * the left; the order and an "only mine" switch on the right. It holds no state — each page
 * reads and writes its filters in the URL and describes its chips:
 *
 *   chips   [{ key, label, icon?, options, searchable? }]  (options as FilterChip takes them)
 *   sort    { options, value, onChange }
 *   mine    { label, checked, onChange }
 *
 * Two groups, so the right one never wraps onto a line of its own: the chips wrap inside the
 * left group, the right group stays on the first line. On phones it drops below.
 */
export function FilterBar({ chips, filters, activeCount, onListChange, onClear, sort, mine }) {
  return (
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
          options={sort.options}
          value={sort.value}
          multiple={false}
          align="end"
          onChange={sort.onChange}
        />
        <Switch checked={mine.checked} label={mine.label} onChange={mine.onChange} />
      </div>
    </div>
  )
}
