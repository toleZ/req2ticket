import {
  House,
  Layers,
  LayoutDashboard,
  ScrollText,
  Settings,
  SquareKanban,
  Timer,
  Users,
} from 'lucide-react'

/* Add a nav item here and it shows up in the sidebar, in the mobile drawer and in the
   breadcrumb — all three read this file. The other two steps are the route in App.jsx
   and the page component in pages/.

   `end` is not decoration, and only "/" needs it: without it the match is a prefix
   match, so Inicio would stay active on /board and two items would be highlighted. */
export const PRIMARY_ITEMS = [{ to: '/', label: 'Inicio', icon: House, end: true }]

export const PROJECT_SECTION_LABEL = 'Proyecto'

export const PROJECT_ITEMS = [
  { to: '/summary', label: 'Resumen', icon: LayoutDashboard },
  { to: '/board', label: 'Tablero', icon: SquareKanban },
  { to: '/epics', label: 'Épicas', icon: Layers },
  { to: '/stories', label: 'Historias', icon: ScrollText },
  { to: '/sprints', label: 'Sprints', icon: Timer },
  { to: '/team', label: 'Equipo', icon: Users },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

export const ALL_NAV_ITEMS = [...PRIMARY_ITEMS, ...PROJECT_ITEMS]
