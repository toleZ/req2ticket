/* Every key here has to match the field it feeds: the inputs send `e.target.name`, the
   status control calls setField with the key written out. */
export const INITIAL_VALUES = {
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  capacity: '',
  status: 'planned',
}

/* Where the focus goes when submit finds an error, keyed like validateSprintForm's result. */
export const FIELD_IDS = {
  name: 'sprint-name',
  startDate: 'sprint-start',
  endDate: 'sprint-end',
  capacity: 'sprint-capacity',
}
