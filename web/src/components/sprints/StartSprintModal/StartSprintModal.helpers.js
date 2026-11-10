/* The sprints whose dates share at least one day with [start, end]. The dates are 'YYYY-MM-DD'
   strings, which compare correctly as text. */
export function overlappingSprints(sprints, start, end) {
  return sprints.filter((sprint) => sprint.startDate <= end && sprint.endDate >= start)
}
