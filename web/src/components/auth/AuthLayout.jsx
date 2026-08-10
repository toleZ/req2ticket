import { NavLink, Outlet } from 'react-router-dom'

const MODES = [
  { to: '/login', label: 'Iniciar sesión' },
  { to: '/register', label: 'Solicitar acceso' },
]

const TAB_CLASSES =
  'flex-1 rounded-control px-3 py-2 text-center text-body font-medium transition-colors'

export function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-4">
      <section className="w-full max-w-sm rounded-card bg-elevated p-6 shadow-card surface-highlight ring-[0.5px] ring-separator">
        <nav
          className="mb-6 flex gap-1 rounded-control bg-fill-tertiary p-1"
          aria-label="Modo de acceso"
        >
          {MODES.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${TAB_CLASSES} ${
                  isActive ? 'bg-elevated text-label shadow-card' : 'text-label-secondary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </section>
    </main>
  )
}
