import { Menu, Moon, Sun } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { IconButton } from '@/components/ui/IconButton/IconButton'
import { ALL_NAV_ITEMS } from '@/lib/navItems'

const TOP_BAR =
  'material-regular hairline-b sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 px-4'

const CRUMB_LIST = 'flex items-center gap-1.5 text-subheadline'
const CRUMB_LINK = `inline-flex min-h-11 items-center text-label-secondary transition-colors duration-fast
  ease-out-quad hover:text-label lg:min-h-6`
const CRUMB_CURRENT = 'truncate font-medium text-label'

/**
 * The bar above every page: the drawer button on small screens, where you are, and the theme
 * toggle. The account lives in the user menu at the foot of the sidebar.
 */
export function TopBar({ onOpenDrawer, isDark, onToggleTheme }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const current = ALL_NAV_ITEMS.find((item) => item.to === pathname)

  return (
    <header className={TOP_BAR}>
      <IconButton label="Abrir la navegación" onClick={onOpenDrawer} className="lg:hidden">
        <Menu className="size-4.5" aria-hidden="true" />
      </IconButton>

      <nav aria-label="Ubicación" className="min-w-0">
        <ol className={CRUMB_LIST}>
          {!isHome && (
            <>
              <li>
                <Link to="/" className={CRUMB_LINK}>
                  Req2Ticket
                </Link>
              </li>
              <li aria-hidden="true" className="text-label-tertiary">
                /
              </li>
            </>
          )}
          <li aria-current="page" className={CRUMB_CURRENT}>
            {current ? current.label : 'Página no encontrada'}
          </li>
        </ol>
      </nav>

      {/* The label says what it does, not the current state: in dark mode it "switches to light". */}
      <IconButton
        label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        onClick={onToggleTheme}
        className="ml-auto"
      >
        {isDark ? (
          <Sun className="size-4.5" aria-hidden="true" />
        ) : (
          <Moon className="size-4.5" aria-hidden="true" />
        )}
      </IconButton>
    </header>
  )
}
