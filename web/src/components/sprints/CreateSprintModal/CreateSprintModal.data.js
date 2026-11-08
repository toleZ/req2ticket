/* Every key here has to match the field it feeds: the inputs send `e.target.name`, the
   date pickers call setField with the key written out. No status: a sprint is born planned. */
export const INITIAL_VALUES = {
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  capacity: '',
}

/* Where the focus goes when submit finds an error, keyed like validateSprintForm's result. */
export const FIELD_IDS = {
  name: 'sprint-name',
  goal: 'sprint-goal',
  startDate: 'sprint-start',
  endDate: 'sprint-end',
  capacity: 'sprint-capacity',
}
