import { Diamond, LayoutGrid, List, RotateCw, Settings, SquareKanban, User } from 'lucide-react'

import { SPRINT_ACTIVE } from '@/lib/options'

/* Add a nav item here and it shows up in the sidebar, in the mobile drawer and in the
   breadcrumb — all three read this file. The other two steps are the route in App.jsx
   and the page component in pages/.

   `end` only on "/": without it the match is a prefix match and Resumen would stay active
   on every page. `badge` names what the item shows on its right (see navBadges). */
export const NAV_ITEMS = [
  { to: '/', label: 'Resumen', icon: LayoutGrid, end: true },
  { to: '/board', label: 'Tablero', icon: SquareKanban, badge: 'activeSprint' },
  { to: '/backlog', label: 'Backlog', icon: List, badge: 'tickets' },
  { to: '/epics', label: 'Épicas', icon: Diamond, badge: 'epics' },
  { to: '/sprints', label: 'Sprints', icon: RotateCw },
  { to: '/team', label: 'Equipo', icon: User, badge: 'users' },
]

/* Not in the nav: it lives in the user menu, at the foot of the sidebar. */
export const SETTINGS_ITEM = { to: '/settings', label: 'Ajustes', icon: Settings }

export const ALL_NAV_ITEMS = [...NAV_ITEMS, SETTINGS_ITEM]

/* "Sprint 14" -> "S14"; any other name stays as it is. */
function shortSprintName(name) {
  const number = name.match(/(\d+)\s*$/)
  return number ? `S${number[1]}` : name
}

/* What each badge shows, from the data the shell already holds. Nothing until it has loaded:
   a count of 0 while loading would be a lie. */
export function navBadges({ tickets, epics, sprints, users, loadState }) {
  if (loadState !== 'ready') return {}

  const active = sprints.find((sprint) => sprint.status === SPRINT_ACTIVE)

  return {
    activeSprint: active ? { text: shortSprintName(active.name), title: active.name, accent: true } : null,
    tickets: { text: String(tickets.length) },
    epics: { text: String(epics.length) },
    users: { text: String(users.length) },
  }
}
