import { LongTextField, SectionHeading, ShortTextField } from './TicketTypeFields.parts'

/* A bug's own fields: how to see it fail. Its severity is a dropdown and goes in the side
   column with the other dropdowns (see TYPE_SELECT in lib/ticketTypes.js). The max lengths are
   the API's. */
export function BugFields({ values, form, errorOf }) {
  return (
    <>
      <div className="flex flex-col gap-5">
        <SectionHeading title="Al reportar" hint="lo que hace falta para verlo fallar" />
        <LongTextField
          form={form}
          name="stepsToReproduce"
          label="Pasos para reproducir"
          value={values.stepsToReproduce}
          required
          maxLength={2000}
          placeholder={'1. Abrir…\n2. …\n3. …'}
          error={errorOf('stepsToReproduce')}
        />
      </div>

      {/* Expected against actual, side by side from md: the label colours tell them apart. */}
      <div className="grid gap-4 md:grid-cols-2">
        <LongTextField
          form={form}
          name="expectedResult"
          label="Resultado esperado"
          tone="green"
          value={values.expectedResult}
          maxLength={1000}
          placeholder="Qué debería pasar"
          error={errorOf('expectedResult')}
        />
        <LongTextField
          form={form}
          name="actualResult"
          label="Resultado obtenido"
          tone="red"
          value={values.actualResult}
          maxLength={1000}
          placeholder="Qué pasa en cambio"
          error={errorOf('actualResult')}
        />
      </div>

      <ShortTextField
        form={form}
        name="environment"
        label="Entorno"
        mono
        value={values.environment}
        maxLength={200}
        placeholder="producción · Chrome 141 · macOS 15"
        error={errorOf('environment')}
      />
    </>
  )
}
