import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { IconButton } from '@/components/ui/IconButton/IconButton'
import { ALL_NAV_ITEMS } from '@/lib/navItems'
import { clearSession, readSession } from '@/lib/auth'

const TOP_BAR =
  'material-regular hairline-b sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 px-4'

const CRUMB_LIST = 'flex items-center gap-1.5 text-subheadline'
const CRUMB_LINK = 'text-label-secondary transition-colors duration-fast ease-out-quad hover:text-label'
const CRUMB_CURRENT = 'truncate font-medium text-label'

export function TopBar({ onOpenDrawer, isDark, onToggleTheme }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const current = ALL_NAV_ITEMS.find((item) => item.to === pathname)

  /* Read on every render instead of being kept in state: the session changes twice per
     lifetime of the app, and both times are followed by a navigation that remounts this. */
  const user = readSession()?.user

  /* Logging out is local: a signed JWT stays valid until it expires, so there is nothing to
     tell the backend. What gets cut is access from this browser.

     `replace` so the back button does not return to the screen that was just closed — there
     RequireAuth would kick the user out again and you would get a loop. */
  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className={TOP_BAR}>
      {/* Small screens only: from lg upwards the rail is visible and the drawer is redundant. */}
      <IconButton label="Abrir la navegación" onClick={onOpenDrawer} className="lg:hidden">
        <Menu className="size-4.5" aria-hidden="true" />
      </IconButton>

      <nav aria-label="Ubicación" className="min-w-0">
        <ol className={CRUMB_LIST}>
          {!isHome && (
            <>
              <li>
                <Link to="/" className={CRUMB_LINK}>
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true" className="text-label-tertiary">
                /
              </li>
            </>
          )}
          <li aria-current="page" className={CRUMB_CURRENT}>
            {current ? current.label : 'Inicio'}
          </li>
        </ol>
      </nav>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        {/* The name is hidden on small screens: there the space belongs to the breadcrumbs. */}
        {user && (
          <span className="hidden max-w-40 truncate text-subheadline text-label-secondary sm:block">
            {user.name}
          </span>
        )}

        {/* Outside the `user &&` on purpose: the theme is an interface preference, not an
            account action. If the session arrives without a `user` field it still has to be
            there. The label describes the action, not the state: in dark mode the button
            "switches to light". */}
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

        {user && (
          <IconButton label="Cerrar sesión" title="Cerrar sesión" onClick={handleLogout}>
            <LogOut className="size-4.5" aria-hidden="true" />
          </IconButton>
        )}
      </div>
    </header>
  )
}
