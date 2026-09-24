import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

// Scaffolding. It says so instead of claiming there is no data it never asked for.
// When this screen is built for real, replace everything below.
export function Home() {
  return (
    <section>
      <PageHeader title="Inicio" />
      <p className="mt-2 max-w-prose text-body text-label-secondary">
        Esta sección está en construcción. Pronto vas a ver acá tu trabajo asignado y cómo va el sprint.
      </p>
    </section>
  )
}
