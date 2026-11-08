import { Select } from '@/components/ui/Select/Select'
import { Field } from './Field'

/**
 * A dropdown on a full-width form row, with its label and error: Field's shell around Select in
 * its `field` look, so it lines up with a TextField.
 *
 * `options` is `[{ value, label, leading?, hint?, disabled? }]`, the same shape Select takes;
 * Select.options.jsx has builders for the app's lists (toneOptions for statuses and priorities,
 * userPickerOptions for people). `onChange` receives the new value, not an event. Short lists
 * need nothing else; long ones pass `searchable` (with `searchLabel` and `noResults`).
 */
export function SelectField({
  id,
  label,
  optional = false,
  value,
  options,
  placeholder,
  searchLabel,
  noResults,
  searchable = false,
  disabled = false,
  error,
  reserveError = false,
  onChange,
}) {
  return (
    <Field id={id} label={label} optional={optional} error={error} reserveError={reserveError}>
      <Select
        id={id}
        value={value}
        options={options}
        placeholder={placeholder}
        searchLabel={searchLabel}
        noResults={noResults}
        searchable={searchable}
        variant="field"
        disabled={disabled}
        error={error}
        onChange={onChange}
      />
    </Field>
  )
}
