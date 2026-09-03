import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

// Scaffolding. When this screen is built for real, replace everything below.
export function Summary() {
  return (
    <section>
      <PageHeader title="Resumen" />
      <p className="mt-2 max-w-prose text-body text-label-secondary">
        Todavía no hay métricas para mostrar.
      </p>
    </section>
  )
}
