import { Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { ALL_NAV_ITEMS } from '@/components/layout/navItems'

const TOP_BAR =
  'material-regular hairline-b sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 px-4'

const MENU_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast ease-out-quad
  hover:bg-fill-tertiary hover:text-label lg:hidden`

const CRUMB_LIST = 'flex items-center gap-1.5 text-subheadline'
const CRUMB_LINK = 'text-label-secondary transition-colors duration-fast ease-out-quad hover:text-label'
const CRUMB_CURRENT = 'truncate font-medium text-label'

export function TopBar({ onOpenDrawer }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const current = ALL_NAV_ITEMS.find((item) => item.to === pathname)

  return (
    <header className={TOP_BAR}>
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Abrir la navegación"
        className={MENU_BUTTON}
      >
        <Menu className="size-4.5" aria-hidden="true" />
      </button>

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
    </header>
  )
}
