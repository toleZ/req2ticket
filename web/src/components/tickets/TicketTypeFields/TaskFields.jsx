import { ChecklistCard } from './TicketTypeFields.parts'

/* A task's own field: one checklist. */
export function TaskFields({ values, form, errorOf }) {
  return (
    <ChecklistCard
      form={form}
      name="checklist"
      label="Checklist"
      addLabel="Añadir ítem"
      items={values.checklist}
      error={errorOf('checklist')}
    />
  )
}
