/* Qué campos extra tiene cada tipo de ticket.

   Este archivo es la única fuente: el modal de alta, el panel de edición y la validación
   leen los mismos objetos. Agregar un campo es agregar una línea acá — no se toca ningún
   componente. Sacarlo es borrar la línea.

   Cada campo es un objeto con:
     name     la clave que viaja a la API dentro de "extraFields". Tiene que coincidir EXACTO
              con la propiedad del record de C# (UserStoryExtras, BugExtras, …). Si no
              coincide, el back responde 400 nombrando la clave: no falla en silencio.
     kind     cómo se dibuja: 'text' | 'textarea' | 'select' | 'checklist'
     label    lo que ve el usuario, en español
     options  solo para kind 'select': [{ value, label }] */

export const EXTRA_FIELDS = {
  /* La narrativa "Como <rol> quiero <acción> para <beneficio>" no está acá a propósito: va en
     la descripción, como texto libre. Lo que queda son los tres checklists que deciden cuándo
     se puede empezar la historia y cuándo está terminada. */
  userStory: [
    { name: 'acceptanceCriteria', kind: 'checklist', label: 'Criterios de aceptación' },
    { name: 'definitionOfReady', kind: 'checklist', label: 'Definition of Ready' },
    { name: 'definitionOfDone', kind: 'checklist', label: 'Definition of Done' },
  ],

  task: [{ name: 'checklist', kind: 'checklist', label: 'Checklist' }],

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
    { name: 'verificationSteps', kind: 'checklist', label: 'Pasos de verificación' },
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

/* Qué lista lleva la barra de progreso de cada tipo. El bug no tiene ninguna, así que no
   muestra barra: null es la respuesta, no un olvido. */
export const CHECKLIST_KEY = {
  userStory: 'acceptanceCriteria',
  task: 'checklist',
  bug: null,
  fix: 'verificationSteps',
}

/* El estado inicial de los campos extra de un tipo: un objeto con una clave por campo.

   Todo arranca en '' (los <input> guardan strings) y los checklist en []. Nunca en
   undefined: un <input> que pasa de undefined a un valor deja de ser controlado y React
   tira un warning en consola que nadie entiende la primera vez. */
export function emptyExtras(type) {
  const values = {}

  EXTRA_FIELDS[type].forEach((field) => {
    values[field.name] = field.kind === 'checklist' ? [] : ''
  })

  return values
}

/* Al revés: lo que devolvió la API -> los valores del formulario.

   Hace falta porque la API omite las claves vacías: el back serializa sin nulls, así que si le
   pasáramos su respuesta directo al <input>, los campos que el ticket no tiene llegarían como
   undefined y el input dejaría de ser controlado. */
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

/* Y de vuelta: los valores del formulario -> el objeto "extraFields" que espera la API.

   Los campos vacíos no se mandan: el back los trata como ausentes, y mandar "" en vez de nada
   guardaría una cadena vacía donde debería no haber clave. */
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

/* Sugerencia para el campo Descripción, por tipo.

   Es solo un placeholder: no se valida, no se guarda distinto y no obliga a nada. La
   descripción sigue siendo texto libre y se puede escribir como se quiera — esto está para
   que no se pierda el formato de historia de usuario ahora que dejó de ser tres campos.

   Vive acá y no en el componente porque es lo mismo que EXTRA_FIELDS: información por tipo. */
export const DESCRIPTION_PLACEHOLDER = {
  userStory: 'Como <rol> quiero <acción> para <beneficio>',
}
