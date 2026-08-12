import { LogOut, Menu } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ALL_NAV_ITEMS } from '@/components/layout/navItems'
import { clearSession, readSession } from '@/lib/auth'

const TOP_BAR =
  'material-regular hairline-b sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 px-4'

const MENU_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast ease-out-quad
  hover:bg-fill-tertiary hover:text-label lg:hidden`

const CRUMB_LIST = 'flex items-center gap-1.5 text-subheadline'
const CRUMB_LINK = 'text-label-secondary transition-colors duration-fast ease-out-quad hover:text-label'
const CRUMB_CURRENT = 'truncate font-medium text-label'

const LOGOUT_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast ease-out-quad
  hover:bg-fill-tertiary hover:text-label`

export function TopBar({ onOpenDrawer }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const current = ALL_NAV_ITEMS.find((item) => item.to === pathname)

  /* Se lee en cada render en vez de guardarse en estado: la sesión cambia dos veces por
     vida de la app, y las dos van seguidas de una navegación que vuelve a montar esto. */
  const user = readSession()?.user

  /* El logout es local: un JWT firmado sigue siendo válido hasta que expira, así que no hay
     nada que avisarle al back. Lo que se corta es el acceso desde este navegador.

     `replace` para que el botón "atrás" no devuelva a la pantalla que se acaba de cerrar —
     ahí RequireAuth expulsaría de nuevo y quedaría un ida y vuelta. */
  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

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

      {user && (
        <div className="ml-auto flex min-w-0 items-center gap-2">
          {/* El nombre se esconde en pantallas chicas: ahí el espacio es para las migas. */}
          <span className="hidden max-w-40 truncate text-subheadline text-label-secondary sm:block">
            {user.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className={LOGOUT_BUTTON}
          >
            <LogOut className="size-4.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </header>
  )
}
