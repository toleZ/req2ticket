/* Which extra fields each ticket type has.

   This file is the only source: the create modal, the edit panel and the validation all read
   the same objects. Adding a field is adding a line here — no component is touched. Removing
   one is deleting the line.

   Each field is an object with:
     name     the key that travels to the API inside "extraFields". It has to match the C#
              record's property EXACTLY (UserStoryExtras, BugExtras, …). If it does not, the
              backend answers 400 naming the key: it does not fail silently.
     kind     how it is drawn: 'text' | 'textarea' | 'select' | 'checklist'
     label    what the user sees, in Spanish
     options  only for kind 'select': [{ value, label }]
     addLabel only for kind 'checklist': the text of the row that adds an item. It lives here
              instead of being built from the label ('Añadir ' + label) because the label is
              plural ("Criterios de aceptación") and the row talks about a single one. */

export const EXTRA_FIELDS = {
  /* The "Como <rol> quiero <acción> para <beneficio>" narrative is deliberately not here: it
     goes in the description, as free text. What is left are the three checklists that decide
     when the story can start and when it is finished. */
  userStory: [
    {
      name: 'acceptanceCriteria',
      kind: 'checklist',
      label: 'Criterios de aceptación',
      addLabel: 'Añadir criterio de aceptación',
    },
    {
      name: 'definitionOfReady',
      kind: 'checklist',
      label: 'Definition of Ready',
      addLabel: 'Añadir condición para empezar',
    },
    {
      name: 'definitionOfDone',
      kind: 'checklist',
      label: 'Definition of Done',
      addLabel: 'Añadir condición para terminar',
    },
  ],

  task: [{ name: 'checklist', kind: 'checklist', label: 'Checklist', addLabel: 'Añadir ítem' }],

  bug: [
    {
      name: 'severity',
      kind: 'select',
      label: 'Severidad',
      options: [
        { value: 'blocker', label: 'Bloqueante' },
        { value: 'major', label: 'Mayor' },
        { value: 'minor', label: 'Menor' },
        { value: 'trivial', label: 'Trivial' },
      ],
    },
    { name: 'stepsToReproduce', kind: 'textarea', label: 'Pasos para reproducir' },
    { name: 'expectedResult', kind: 'textarea', label: 'Resultado esperado' },
    { name: 'actualResult', kind: 'textarea', label: 'Resultado obtenido' },
    { name: 'environment', kind: 'text', label: 'Entorno' },
  ],

  fix: [
    { name: 'rootCause', kind: 'textarea', label: 'Causa raíz' },
    { name: 'solution', kind: 'textarea', label: 'Solución aplicada' },
    {
      name: 'verificationSteps',
      kind: 'checklist',
      label: 'Pasos de verificación',
      addLabel: 'Añadir paso de verificación',
    },
    {
      name: 'regressionRisk',
      kind: 'select',
      label: 'Riesgo de regresión',
      options: [
        { value: 'low', label: 'Bajo' },
        { value: 'medium', label: 'Medio' },
        { value: 'high', label: 'Alto' },
      ],
    },
  ],
}

/* Which list carries each type's progress bar. The bug has none, so it shows no bar: null is
   the answer, not an oversight. */
export const CHECKLIST_KEY = {
  userStory: 'acceptanceCriteria',
  task: 'checklist',
  bug: null,
  fix: 'verificationSteps',
}

/* The initial state of a type's extra fields: an object with one key per field.

   Everything starts at '' (an <input> holds strings) and the checklists at []. Never at
   undefined: an <input> that goes from undefined to a value stops being controlled, and React
   logs a warning nobody understands the first time. */
export function emptyExtras(type) {
  const values = {}

  EXTRA_FIELDS[type].forEach((field) => {
    values[field.name] = field.kind === 'checklist' ? [] : ''
  })

  return values
}

/* The other way round: what the API returned -> the form values.

   It is needed because the API omits empty keys: the backend serializes without nulls, so
   handing its response straight to an <input> would deliver undefined for the fields the
   ticket does not have, and the input would stop being controlled. */
export function toFormValues(type, extraFields) {
  const values = emptyExtras(type)
  if (!extraFields) return values

  EXTRA_FIELDS[type].forEach((field) => {
    const value = extraFields[field.name]
    if (value === undefined || value === null) return

    values[field.name] = field.kind === 'checklist' ? value : String(value)
  })

  return values
}

/* And back again: the form values -> the "extraFields" object the API expects.

   Empty fields are not sent: the backend treats them as absent, and sending "" instead of
   nothing would store an empty string where there should be no key at all. */
export function toExtraFieldsPayload(type, values) {
  const payload = {}

  EXTRA_FIELDS[type].forEach((field) => {
    const value = values[field.name]

    if (field.kind === 'checklist') {
      if (value.length > 0) payload[field.name] = value
      return
    }

    if (value === '') return

    payload[field.name] = value
  })

  return payload
}

/* Suggestion for the Description field, per type.

   It is only a placeholder: it is not validated, it is not stored differently and it forces
   nothing. The description is still free text and can be written however you like — this is
   here so the user-story format is not lost now that it is no longer three fields.

   It lives here and not in the component because it is the same thing as EXTRA_FIELDS:
   information per type. */
export const DESCRIPTION_PLACEHOLDER = {
  userStory: 'Como <rol> quiero <acción> para <beneficio>',
}
