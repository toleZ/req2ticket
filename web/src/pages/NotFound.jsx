import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-4">
      <section className="text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-2 text-title1 text-label">Página no encontrada</h1>
        <p className="mt-2 text-body text-label-secondary">
          La dirección que abriste no existe o cambió de lugar.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-control bg-blue px-4 py-2 text-body font-medium text-white"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
