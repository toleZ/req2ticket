import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

// Scaffolding. When this screen is built for real, replace everything below.
export function Home() {
  return (
    <section>
      <PageHeader title="Inicio" />
      <p className="mt-2 max-w-prose text-body text-label-secondary">
        Todavía no hay proyectos para mostrar.
      </p>
    </section>
  )
}
