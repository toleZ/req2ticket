import { cn } from '@/lib/cn'

const GROUP = 'flex rounded-control bg-fill-tertiary p-1'

const OPTION = `flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--radius-control)-0.25rem)]
  px-2.5 text-footnote font-medium text-label-secondary transition-colors duration-fast ease-out-quad
  hover:text-label peer-checked:bg-elevated peer-checked:text-label peer-checked:shadow-hairline
  peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue/55
  peer-disabled:cursor-default peer-disabled:opacity-50 lg:min-h-8`

/* Native radios under the hood, so Tab reaches the group once and the arrows move the choice. */
export function SegmentedField({ name, legend, options, value, disabled = false, onChange, className }) {
  return (
    <fieldset className={cn(GROUP, className)} disabled={disabled}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const Icon = option.icon
        return (
          <label key={option.value} className="flex flex-1">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className={OPTION}>
              {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
              {option.label}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
