import { useState } from 'react'

import { SprintRow } from '@/components/sprints/SprintRow/SprintRow'
import { FoldHeader } from '@/components/ui/FoldHeader/FoldHeader'
import { SPRINT_COMPLETED } from '@/lib/options'
import { readUiPref, writeUiPref } from '@/lib/uiPrefs'

/* Whether "Sprints completados" is folded, remembered like the Tickets sections. Folded until
   you open it: they are history, and planning happens above. */
const FOLDED_PREF = 'backlog.completedSprints.folded'

/**
 * The sprint list, with the same rows and spacing as the epic list: the active and planned
 * sprints first, and the completed ones folded at the end under the same header the Tickets
 * page uses for its statuses (FoldHeader).
 *
 * `tickets` is every ticket in the project: each row gets its own already-filtered slice.
 * Tickets with no sprint are not shown here — they belong to SprintBacklog, further down
 * the page. The rest goes to every row as it is (see SprintRow).
 */
export function SprintList({ sprints, tickets, ...rowProps }) {
  const [folded, setFolded] = useState(() => readUiPref(FOLDED_PREF, true))

  const current = sprints.filter((sprint) => sprint.status !== SPRINT_COMPLETED)
  const completed = sprints.filter((sprint) => sprint.status === SPRINT_COMPLETED)

  function toggle() {
    setFolded(!folded)
    writeUiPref(FOLDED_PREF, !folded)
  }

  const rows = (list) =>
    list.map((sprint) => (
      <SprintRow
        key={sprint.id}
        sprint={sprint}
        sprints={sprints}
        tickets={tickets.filter((ticket) => ticket.sprintId === sprint.id)}
        {...rowProps}
      />
    ))

  return (
    <>
      {current.length > 0 && <ul className="mt-4 flex flex-col gap-2">{rows(current)}</ul>}

      {completed.length > 0 && (
        <div className="mt-4">
          <FoldHeader title="Sprints completados" count={completed.length} folded={folded} onToggle={toggle} />
          {!folded && <ul className="mt-2 flex flex-col gap-2">{rows(completed)}</ul>}
        </div>
      )}
    </>
  )
}
