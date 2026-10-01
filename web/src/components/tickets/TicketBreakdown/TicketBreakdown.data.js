/* The order the breakdown reads in: work under way first, then work not started, then what
   is finished, and last what was dropped. Not the flow order of TICKET_STATUS_OPTIONS on
   purpose — this panel answers "what is happening now", so the live statuses lead. The same
   order drives the bar, the legend and the list, so the three never disagree. */
export const STATUS_ORDER = ['inProgress', 'inReview', 'testing', 'todo', 'backlog', 'done', 'cancelled']

/* Fills for the bar's segments and the legend's dots. Same hues as the status badges (see
   lib/options.js), written out because Tailwind only keeps class names it can read whole.
   The two not-started statuses are both grey, a step apart, so neither looks like progress.
   Cancelled has no fill: it is not in the bar, and its legend dot is drawn hollow. */
export const SEGMENT_CLASSES = {
  inProgress: 'bg-blue',
  inReview: 'bg-indigo',
  testing: 'bg-purple',
  todo: 'bg-gray',
  backlog: 'bg-gray2',
  done: 'bg-green',
}

/* How many tickets the list card shows. Past that, the link to the Backlog takes over: the
   panel is a summary, the Backlog is where the whole list lives. */
export const LIST_LIMIT = 5
