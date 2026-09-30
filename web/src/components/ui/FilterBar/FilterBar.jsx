import { ArrowUpDown } from 'lucide-react'

import { FilterChip } from '@/components/ui/FilterChip/FilterChip'
import { Switch } from '@/components/ui/Switch/Switch'
import { BAR, CHIP_GROUP, CLEAR_BUTTON, END_GROUP } from './FilterBar.styles'

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
    <div className={BAR}>
      <div className={CHIP_GROUP}>
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
            className={CLEAR_BUTTON}
          >
            Limpiar {activeCount === 1 ? '1 filtro' : `${activeCount} filtros`}
          </button>
        )}
      </div>

      <div className={END_GROUP}>
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
