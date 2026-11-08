import { ChecklistCard } from './TicketTypeFields.parts'

/* A story's own fields: the three checklists that decide when it can start and when it is
   finished. The "Como <rol> quiero…" narrative is not here: it goes in the description. */
export function UserStoryFields({ values, form, errorOf }) {
  return (
    <>
      <ChecklistCard
        form={form}
        name="acceptanceCriteria"
        label="Criterios de aceptación"
        addLabel="Añadir criterio de aceptación"
        items={values.acceptanceCriteria}
        error={errorOf('acceptanceCriteria')}
      />
      <ChecklistCard
        form={form}
        name="definitionOfReady"
        label="Definition of Ready"
        addLabel="Añadir condición para empezar"
        items={values.definitionOfReady}
        error={errorOf('definitionOfReady')}
      />
      <ChecklistCard
        form={form}
        name="definitionOfDone"
        label="Definition of Done"
        addLabel="Añadir condición para terminar"
        items={values.definitionOfDone}
        error={errorOf('definitionOfDone')}
      />
    </>
  )
}
