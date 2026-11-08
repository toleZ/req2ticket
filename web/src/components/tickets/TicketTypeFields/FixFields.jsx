import { ChecklistCard, LongTextField, SectionHeading } from './TicketTypeFields.parts'

/* A fix's own fields: what broke, what changed and how it was checked. Its regression risk is a
   dropdown and goes in the side column (see TYPE_SELECT in lib/ticketTypes.js). */
export function FixFields({ values, form, errorOf }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeading title="Al investigar" hint="qué lo rompía y cómo se comprobó" />
      <LongTextField
        form={form}
        name="rootCause"
        label="Causa raíz"
        value={values.rootCause}
        maxLength={2000}
        placeholder="Por qué pasaba"
        error={errorOf('rootCause')}
      />
      <LongTextField
        form={form}
        name="solution"
        label="Solución aplicada"
        value={values.solution}
        maxLength={2000}
        placeholder="Qué se cambió para arreglarlo"
        error={errorOf('solution')}
      />
      <ChecklistCard
        form={form}
        name="verificationSteps"
        label="Pasos de verificación"
        addLabel="Añadir paso de verificación"
        items={values.verificationSteps}
        error={errorOf('verificationSteps')}
      />
    </div>
  )
}
