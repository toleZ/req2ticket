export const INITIAL_VALUES = {
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  capacity: '',
  status: 'planned',
/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */

}
