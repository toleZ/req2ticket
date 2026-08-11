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
   breadcrumb — all three read this file. See ./README.md for the other two steps.

   `end` is not decoration, and only "/" needs it: without it the match is a prefix
   match, so Inicio would stay active on /tablero and two items would be highlighted. */
export const PRIMARY_ITEMS = [{ to: '/', label: 'Inicio', icon: House, end: true }]

export const PROJECT_SECTION_LABEL = 'Proyecto'

export const PROJECT_ITEMS = [
  { to: '/resumen', label: 'Resumen', icon: LayoutDashboard },
  { to: '/tablero', label: 'Tablero', icon: SquareKanban },
  { to: '/funcionalidades', label: 'Funcionalidades', icon: Layers },
  { to: '/historias', label: 'Historias', icon: ScrollText },
  { to: '/sprints', label: 'Sprints', icon: Timer },
  { to: '/equipo', label: 'Equipo', icon: Users },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]

export const ALL_NAV_ITEMS = [...PRIMARY_ITEMS, ...PROJECT_ITEMS]
