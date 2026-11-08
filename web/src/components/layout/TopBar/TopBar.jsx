import { Menu, Moon, Sun } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { IconButton } from '@/components/ui/IconButton/IconButton'
import { ALL_NAV_ITEMS, projectPath, sectionOf } from '@/lib/navItems'
import { CRUMB_CURRENT, CRUMB_LINK, CRUMB_LIST, TOP_BAR } from './TopBar.styles'

/**
 * The bar above every page: the drawer button on small screens, where you are
 * ("Tienda online / Backlog") and the theme toggle. Your role in the project shows on the
 * project card, at the top of the sidebar; the account lives in the user menu at its foot.
 */
export function TopBar({ project, onOpenDrawer, isDark, onToggleTheme }) {
  const { pathname } = useLocation()
  const section = sectionOf(pathname)
  const inProject = section !== null && project
  const current = ALL_NAV_ITEMS.find((item) => item.to === (section ?? pathname.slice(1)))

  return (
    <header className={TOP_BAR}>
      <IconButton label="Abrir la navegación" onClick={onOpenDrawer} className="lg:hidden">
        <Menu className="size-4.5" aria-hidden="true" />
      </IconButton>

      <nav aria-label="Ubicación" className="min-w-0">
        <ol className={CRUMB_LIST}>
          {inProject && (
            <>
              <li className="min-w-0 truncate">
                <Link to={projectPath(project.key)} className={CRUMB_LINK}>
                  {project.name}
                </Link>
              </li>
              <li aria-hidden="true" className="text-label-tertiary">
                /
              </li>
            </>
          )}
          <li aria-current="page" className={CRUMB_CURRENT}>
            {current ? current.label : pathname === '/' ? 'Req2Ticket' : 'Página no encontrada'}
          </li>
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* The label says what it does, not the current state: in dark mode it "switches to light". */}
        <IconButton
          label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          onClick={onToggleTheme}
        >
          {isDark ? (
            <Sun className="size-4.5" aria-hidden="true" />
          ) : (
            <Moon className="size-4.5" aria-hidden="true" />
          )}
        </IconButton>
      </div>
    </header>
  )
}
