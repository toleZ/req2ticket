import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

// Scaffolding. It says so instead of claiming there is no data it never asked for.
// When this screen is built for real, replace everything below.
export function Summary() {
  return (
    <section>
      <PageHeader title="Resumen" />
      <p className="mt-2 max-w-prose text-body text-label-secondary">
        Esta sección está en construcción. Pronto vas a ver acá las métricas del proyecto.
      </p>
    </section>
  )
}
