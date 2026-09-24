import { Link } from 'react-router-dom'

import { BASE, SIZE_CLASSES, VARIANT_CLASSES } from '@/components/ui/Button/Button.styles'

/* Rendered inside AppShell (see App.jsx), so it is page content and not a <main> of its own.
   The link wears Button's classes: it navigates, so it is an <a>, but it should look and size
   exactly like the primary button everywhere else. */
export function NotFound() {
  return (
    <section className="grid place-items-center py-16 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 text-title1 text-label">Página no encontrada</h1>
      <p className="mt-2 max-w-prose text-body text-label-secondary">
        La dirección que abriste no existe o cambió de lugar.
      </p>
      <Link to="/" className={`${BASE} ${SIZE_CLASSES.md} ${VARIANT_CLASSES.primary} mt-6`}>
        Volver al inicio
      </Link>
    </section>
  )
}
