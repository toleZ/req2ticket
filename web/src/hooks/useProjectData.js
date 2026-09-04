import { useEffect, useState } from 'react'

import { deleteTicket, getEpics, getSprints, getTickets, getUsers, updateTicket } from '@/lib/api'

/**
 * The four lists the project screens work with — tickets, epics, sprints and users — loaded
 * once and shared.
 *
 * Call it in AppShell and nowhere else. AppShell is a layout route, so it stays mounted while
 * you move between /epics, /tickets and /sprints; only the page under its <Outlet /> is
 * replaced. That is what makes one load enough. Each page used to run this same Promise.all on
 * mount, so walking Tickets → Épicas → Sprints → Tickets fired sixteen requests for four lists
 * — thirty-two in development, where StrictMode runs every effect twice.
 *
 * The pages receive all of this through `<Outlet context={…} />` and read it with
 * `useOutletContext()`. That is props, delivered by the router — no store, no Context of ours.
 *
 * Sharing one `tickets` array is the other half of the point: a ticket edited from the Épicas
 * screen and the same ticket on the Tickets screen are now literally the same object, instead
 * of two lists that happened to agree.
 *
 * The setters come back out because each page still owns its own entity: Épicas creates and
 * deletes epics, Sprints creates and deletes sprints, and both of those also have to touch
 * `tickets` (deleting an epic cascades, deleting a sprint sends its tickets to the backlog).
 * Only the two ticket handlers live here, because those three were identical word for word.
 */
export function useProjectData() {
  const [tickets, setTickets] = useState([])
  const [epics, setEpics] = useState([])
  const [sprints, setSprints] = useState([])
  const [users, setUsers] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [reloadKey, setReloadKey] = useState(0)

  /* `reloadKey` is the retry: bumping it by one makes React run the effect again, which is how
     you repeat a load without pulling the fetch out of the effect.

     The effect does not set loadState to 'loading': the initial state already is, and doing it
     here would cost an extra render. `reload` does, because there it answers a click. */
  useEffect(() => {
    /* `active` is what the cleanup switches off, and it fixes two things. A response that
       arrives after AppShell unmounts no longer writes state. And if `reload` started a newer
       load, the older one is discarded instead of landing last and overwriting it. */
    let active = true

    Promise.all([getTickets(), getEpics(), getSprints(), getUsers()])
      .then(([nextTickets, nextEpics, nextSprints, nextUsers]) => {
        if (!active) return

        setTickets(nextTickets)
        setEpics(nextEpics)
        setSprints(nextSprints)
        setUsers(nextUsers)
        setLoadState('ready')
      })
      .catch(() => {
        if (active) setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  function reload() {
    setLoadState('loading')
    /* The updater form, not `reloadKey + 1`: this way it does not read a value captured when
       the function was created. */
    setReloadKey((key) => key + 1)
  }

  /* updateTicket returns the ticket freshly read from the API, so it is replaced whole instead
     of being rebuilt by hand: the response already carries epicName, sprintName, assigneeName
     and updatedAt recalculated, and updatedAt cannot be guessed from the browser at all. */
  async function updateTicketAndStore(ticket, patch) {
    const updated = await updateTicket(ticket, patch)
    setTickets((prev) => prev.map((current) => (current.id === updated.id ? updated : current)))
  }

  async function deleteTicketAndStore(ticket) {
    await deleteTicket(ticket.id)
    setTickets((prev) => prev.filter((current) => current.id !== ticket.id))
  }

  return {
    tickets,
    setTickets,
    epics,
    setEpics,
    sprints,
    setSprints,
    users,
    loadState,
    reload,
    updateTicketAndStore,
    deleteTicketAndStore,
  }
}
