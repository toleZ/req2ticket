import { Link, Outlet, useLocation } from 'react-router-dom'

import { DEFAULT_FOOTER, FOOTERS } from './AuthLayout.data'
import { BLOB_BLUE, BLOB_PINK, BRAND_TILE, CARD, FOOTER, PAGE } from './AuthLayout.styles'

export function AuthLayout() {
  const { pathname } = useLocation()
  const footer = FOOTERS[pathname] ?? DEFAULT_FOOTER

  return (
    <main className={PAGE}>
      <div aria-hidden="true" className={BLOB_BLUE} />
      <div aria-hidden="true" className={BLOB_PINK} />

      <div className="relative w-full max-w-sm">
        <section className={CARD}>
          <div className="mb-6 flex justify-center">
            <Link
              to="/"
              aria-label="Req2Ticket"
              className={BRAND_TILE}
            >
              R2
            </Link>
          </div>

          <Outlet />
        </section>

        <p className={FOOTER}>
          {footer.text}{' '}
          <Link to={footer.to} className="font-medium text-blue-text hover:underline">
            {footer.cta}
          </Link>
        </p>
      </div>
    </main>
  )
}
