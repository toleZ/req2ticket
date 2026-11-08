import { CircleUser, Diamond, LayoutGrid, List, RotateCw, Settings, SquareKanban, User } from 'lucide-react'

import { SPRINT_ACTIVE } from '@/lib/options'

/* Add a nav item here and it shows up in the sidebar, in the mobile drawer and in the
   breadcrumb — all three read this file. The other two steps are the route in App.jsx
   and the page component in pages/.

   Every section lives inside a project: /p/R2T/board, /p/R2T/backlog… `to` is the part after
   the project (empty for Resumen); projectPath() builds the whole address. `badge` names what
   the item shows on its right (see navBadges). */
export const NAV_ITEMS = [
  { to: '', label: 'Resumen', icon: LayoutGrid, end: true },
  { to: 'board', label: 'Tablero', icon: SquareKanban, badge: 'activeSprint' },
  { to: 'backlog', label: 'Backlog', icon: List, badge: 'tickets' },
  { to: 'epics', label: 'Épicas', icon: Diamond, badge: 'epics' },
  { to: 'sprints', label: 'Sprints', icon: RotateCw },
  { to: 'team', label: 'Equipo', icon: User, badge: 'users' },
]

/* Not in the nav. The project's settings open from the project menu (the card at the top of
   the sidebar); your account, from the user menu at its foot, outside any project (/account). */
export const SETTINGS_ITEM = { to: 'settings', label: 'Configuración del proyecto', icon: Settings }
export const ACCOUNT_ITEM = { to: 'account', label: 'Mi cuenta', icon: CircleUser }

export const ALL_NAV_ITEMS = [...NAV_ITEMS, SETTINGS_ITEM, ACCOUNT_ITEM]

/* /p/R2T for Resumen, /p/R2T/backlog for a section. */
export function projectPath(projectKey, to = '') {
  return to ? `/p/${projectKey}/${to}` : `/p/${projectKey}`
}

/* Where to go when switching to another project: the same section in the other project
   (DATA-1, ENT-1). The query string is dropped on purpose — its filters name epics, sprints and
   people of the project you are leaving. */
export function switchProjectPath(pathname, projectKey) {
  const section = pathname.match(/^\/p\/[^/]+\/([^/]+)/)?.[1] ?? ''
  return projectPath(projectKey, section)
}

/* The section of the current address ('' for Resumen), or null outside a project. */
export function sectionOf(pathname) {
  const match = pathname.match(/^\/p\/[^/]+(?:\/([^/]+))?/)
  if (!match) return null
  return match[1] ?? ''
}

/* "Sprint 14" -> "S14"; any other name stays as it is. */
function shortSprintName(name) {
  const number = name.match(/(\d+)\s*$/)
  return number ? `S${number[1]}` : name
}

/* What each badge shows. Nothing until every list has loaded: a count of 0 while loading would
   be a lie. */
export function navBadges({ tickets, epics, sprints, members }) {
  if (!tickets || !epics || !sprints || !members) return {}

  const active = sprints.find((sprint) => sprint.status === SPRINT_ACTIVE)

  return {
    activeSprint: active ? { text: shortSprintName(active.name), title: active.name, accent: true } : null,
    tickets: { text: String(tickets.length) },
    epics: { text: String(epics.length) },
    users: { text: String(members.length) },
  }
}
