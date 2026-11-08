import { BugFields } from './BugFields'
import { FixFields } from './FixFields'
import { TaskFields } from './TaskFields'
import { UserStoryFields } from './UserStoryFields'

/**
 * The fields of a ticket's own type, in the main column of the create sheet and the detail
 * sheet: a story's three checklists, a task's checklist, a bug's report, a fix's investigation.
 * Each type has its own component; this one only picks it. The type's dropdown (a bug's
 * severity, a fix's regression risk) goes in the side column instead: see TYPE_SELECT.
 *
 * It has no state of its own: whoever uses it owns `values` (the form's `typeFields`) and gets
 * every change through `onChange(name, value)`.
 *
 *   errors              { fieldName: message }, shown under each field
 *   optional            adds "(opcional)" to what is not required (the create sheet)
 *   readOnly            every value as text and nothing to press (no tickets.write, closed epic)
 *   onChecklistToggle   (name, items): saves a tick at once (the detail sheet)
 *   checklistError      { name, message } of the last tick that failed to save
 */
export function TicketTypeFields({
  type,
  values,
  onChange,
  disabled = false,
  readOnly = false,
  optional = false,
  idPrefix,
  errors = {},
  onChecklistToggle,
  checklistError,
}) {
  // What every field needs, passed down as one object instead of seven props.
  const form = { disabled, readOnly, optional, idPrefix, onChange, onChecklistToggle }

  function errorOf(name) {
    if (errors[name]) return errors[name]
    return checklistError?.name === name ? checklistError.message : ''
  }

  if (type === 'userStory') return <UserStoryFields values={values} form={form} errorOf={errorOf} />
  if (type === 'task') return <TaskFields values={values} form={form} errorOf={errorOf} />
  if (type === 'bug') return <BugFields values={values} form={form} errorOf={errorOf} />
  if (type === 'fix') return <FixFields values={values} form={form} errorOf={errorOf} />
  return null
}
