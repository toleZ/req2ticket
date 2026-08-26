import { Link, Outlet, useLocation } from 'react-router-dom'

/* Cada ruta de auth linkea a la otra desde el pie, en vez de compartir un tab nav. */
const FOOTERS = {
  '/register': {
    text: '¿Ya tenés una cuenta?',
    cta: 'Iniciar sesión',
    to: '/login',
  },
}
const DEFAULT_FOOTER = {
  text: '¿No tenés una cuenta?',
  cta: 'Crear cuenta',
  to: '/register',
}

export function AuthLayout() {
  const { pathname } = useLocation()
  const footer = FOOTERS[pathname] ?? DEFAULT_FOOTER

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-base px-4">
      {/* Las únicas manchas de color de la pantalla: todo el resto de la app usa
          brand-tile como único degradado, esto son dos blobs desenfocados detrás
          de la card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue/25 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-pink/20 blur-[110px]"
      />

      <div className="relative w-full max-w-sm">
        <section className="rounded-card bg-elevated p-8 shadow-raised surface-highlight ring-1 ring-separator-opaque">
          <div className="mb-6 flex justify-center">
            <Link
              to="/"
              aria-label="Req2Ticket"
              className="brand-tile grid size-14 place-items-center rounded-2xl font-display text-title2 font-extrabold text-white"
            >
              R2
            </Link>
          </div>

          <Outlet />
        </section>

        <p className="mt-6 text-center text-footnote text-label-secondary">
          {footer.text}{' '}
          <Link to={footer.to} className="font-medium text-blue hover:underline">
            {footer.cta}
          </Link>
        </p>
      </div>
    </main>
  )
}
