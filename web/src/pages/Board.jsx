import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

// Scaffolding. When this screen is built for real, replace everything below.
export function Board() {
  return (
    <section>
      <PageHeader title="Tablero" />
      <p className="mt-2 max-w-prose text-body text-label-secondary">
        Todavía no hay tarjetas en el tablero.
      </p>
    </section>
  )
}
