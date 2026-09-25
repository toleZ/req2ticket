/* Every key here has to match the field it feeds: the name box sends `e.target.name`, the
   other controls call setField with the key written out. */
export const INITIAL_VALUES = {
  name: '',
  description: '',
  accentColor: 'blue',
  priority: 'medium',
  status: 'backlog',
  ownerId: '',
}

/* Where the focus goes when submit finds an error, keyed like validateEpicForm's result. */
export const FIELD_IDS = { name: 'epic-name' }
