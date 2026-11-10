/* What differs between the four ticket types (ENT-2): which fields of its own each one has,
   how they go to and from the API, and the texts that describe each type.

   The fields themselves are drawn by one component per type, in
   components/tickets/TicketTypeFields/ (UserStoryFields, TaskFields, BugFields, FixFields).
   Adding a field to a type means: its empty value here, its line in typeFieldsToForm and
   typeFieldsToPayload, and the field in that type's component.

   On the wire, a type's fields travel in an object named after the type, next to the common
   ones: { type: 'bug', title, …, bug: { severity, stepsToReproduce, … } }. The keys have to
   match the API EXACTLY: an unknown key is a 400 naming it, it never fails silently. */

import { BUG_SEVERITY_OPTIONS, REGRESSION_RISK_OPTIONS } from '@/lib/options'

/* The one dropdown a type has of its own, drawn in the side column of the create and detail
   sheets next to the common ones. Stories and tasks have none. */
export const TYPE_SELECT = {
  bug: { name: 'severity', label: 'Severidad', options: BUG_SEVERITY_OPTIONS },
  fix: { name: 'regressionRisk', label: 'Riesgo de regresión', options: REGRESSION_RISK_OPTIONS },
}

/* Only stories and tasks are estimated. Bugs and fixes have no points at all. */
export const HAS_POINTS = {
  userStory: true,
  task: true,
  bug: false,
  fix: false,
}

/* The most items a list may have, same as the API. At that point the "add" row is disabled. */
export const MAX_CHECKLIST_ITEMS = 30

/* Which types a ticket may hang from, same rule as TicketService.AllowedParentTypes: a story
   hangs from nothing (at most from an epic), tasks and bugs from a story, and a fix always from a
   bug. A child takes its parent's epic, and a task its story's sprint. */
export const PARENT_TYPES = {
  userStory: [],
  task: ['userStory'],
  bug: ['userStory'],
  fix: ['bug'],
}

/* The empty form values of a type's own fields.

   Texts start at '' (an <input> holds strings) and lists at []. Never at undefined: an <input>
   that goes from undefined to a value stops being controlled, and React logs a warning nobody
   understands the first time. The two selects start at the API's default (minor, low), so what
   the form shows is what would be saved. */
export function emptyTypeFields(type) {
  if (type === 'userStory') {
    return { acceptanceCriteria: [], definitionOfReady: [], definitionOfDone: [] }
  }
  if (type === 'task') {
    return { checklist: [] }
  }
  if (type === 'bug') {
    return { severity: 'minor', stepsToReproduce: '', expectedResult: '', actualResult: '', environment: '' }
  }
  return { rootCause: '', solution: '', verificationSteps: [], regressionRisk: 'low' }
}

/* null from the API → '' for an input. */
function text(value) {
  return value ?? ''
}

/* What the API returned → the form values. `fields` is the type's object of the detail
   (ticket.bug, ticket.userStory…). Points are left out: the form keeps them apart, because they
   are drawn with their own control (see ticketToFormValues). */
export function typeFieldsToForm(type, fields) {
  if (!fields) return emptyTypeFields(type)

  if (type === 'userStory') {
    return {
      acceptanceCriteria: fields.acceptanceCriteria ?? [],
      definitionOfReady: fields.definitionOfReady ?? [],
      definitionOfDone: fields.definitionOfDone ?? [],
    }
  }
  if (type === 'task') {
    return { checklist: fields.checklist ?? [] }
  }
  if (type === 'bug') {
    return {
      severity: fields.severity ?? 'minor',
      stepsToReproduce: text(fields.stepsToReproduce),
      expectedResult: text(fields.expectedResult),
      actualResult: text(fields.actualResult),
      environment: text(fields.environment),
    }
  }
  return {
    rootCause: text(fields.rootCause),
    solution: text(fields.solution),
    verificationSteps: fields.verificationSteps ?? [],
    regressionRisk: fields.regressionRisk ?? 'low',
  }
}

/* '' from an input → null for the API. */
function textOrNull(value) {
  return value === '' || value === undefined ? null : value
}

/* A list as the API expects it: only text and done. */
function items(list) {
  return (list ?? []).map((item) => ({ text: item.text, done: Boolean(item.done) }))
}

/* '' means "not estimated" and travels as null, never as 0. */
function pointsOrNull(points) {
  return points === '' || points === null || points === undefined ? null : Number(points)
}

/* And back again: the form values → the type's object the API expects. */
export function typeFieldsToPayload(type, values, points) {
  if (type === 'userStory') {
    return {
      points: pointsOrNull(points),
      acceptanceCriteria: items(values.acceptanceCriteria),
      definitionOfReady: items(values.definitionOfReady),
      definitionOfDone: items(values.definitionOfDone),
    }
  }
  if (type === 'task') {
    return { points: pointsOrNull(points), checklist: items(values.checklist) }
  }
  if (type === 'bug') {
    return {
      severity: values.severity,
      stepsToReproduce: textOrNull(values.stepsToReproduce),
      expectedResult: textOrNull(values.expectedResult),
      actualResult: textOrNull(values.actualResult),
      environment: textOrNull(values.environment),
    }
  }
  return {
    rootCause: textOrNull(values.rootCause),
    solution: textOrNull(values.solution),
    verificationSteps: items(values.verificationSteps),
    regressionRisk: values.regressionRisk,
  }
}

/* The API's field errors (ApiError.fieldErrors) as the form's: the type's fields arrive as
   "bug.stepsToReproduce", and the form knows them as "stepsToReproduce". */
export function toFormErrors(fieldErrors = {}, type) {
  const errors = {}
  Object.entries(fieldErrors).forEach(([key, message]) => {
    const name = key.startsWith(`${type}.`) ? key.slice(type.length + 1) : key
    errors[name.split('[')[0]] = message
  })
  return errors
}

/* The COMPLETE values of an existing ticket, built from its detail — what updateTicket needs,
   since the PUT replaces everything. Change what you need on top of this:

       updateTicket(projectId, ticket.id, { ...ticketToFormValues(ticket), title: 'Nuevo' }) */
export function ticketToFormValues(ticket) {
  const fields = ticket[ticket.type]

  return {
    type: ticket.type,
    title: ticket.title,
    description: ticket.description ?? '',
    epicId: ticket.epicId ?? '',
    priority: ticket.priority,
    assigneeId: ticket.assigneeId ?? '',
    sprintId: ticket.sprintId ?? '',
    parentId: ticket.parentId ?? '',
    points: HAS_POINTS[ticket.type] ? (fields?.points ?? '') : '',
    typeFields: typeFieldsToForm(ticket.type, fields),
  }
}

/* Suggestion for the Description field, per type. Only a placeholder: the description is free
   text. It keeps the user-story format in view ("Como <rol> quiero…") without forcing it. */
export const DESCRIPTION_PLACEHOLDER = {
  userStory: 'Como <rol> quiero <acción> para <beneficio>',
  task: 'Qué hay que hacer y por qué',
  bug: 'Qué falla, en pocas palabras',
  fix: 'Qué bug arregla y en qué consiste',
}

/* The four cards the create sheet starts with: what each type is, in one line (ENT-2). */
export const TYPE_CARD_TEXT = {
  userStory: 'Algo que el usuario necesita, contado desde su lado.',
  task: 'Trabajo concreto del equipo, suelto o dentro de una historia.',
  bug: 'Algo que no funciona como debería.',
  fix: 'La reparación de un bug.',
}

/* The line under the title of the create sheet: what this type carries and what it does not. */
export const TYPE_INTRO = {
  userStory: 'Una historia se cierra con sus criterios de aceptación. DoR y DoD son opcionales.',
  task: 'La tarea suma una checklist: ni criterios, ni DoR, ni DoD.',
  bug: 'Un bug describe cómo verlo fallar. La causa y el arreglo van en un fix.',
  fix: 'Un fix cuenta qué lo rompía, qué se cambió y cómo se comprobó.',
}
