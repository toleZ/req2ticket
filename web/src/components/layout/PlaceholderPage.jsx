import { PageHeader } from '@/components/layout/PageHeader'

/**
 * A page that exists in the sidebar but has nothing in it yet: a title and a line saying
 * so. Inicio, Resumen, Tablero, Equipo and Ajustes all use it today.
 *
 * When you build one of those screens for real, delete the call and write the page — this
 * is scaffolding, not a base component to build on.
 *
 * `description` is not PageHeader's `subtitle`: the subtitle is small print under a title
 * that has content below it, and here the sentence *is* the content, so it is body-sized
 * and width-limited for reading.
 */
export function PlaceholderPage({ title, description }) {
  return (
    <section>
      <PageHeader title={title} />
      <p className="mt-2 max-w-prose text-body text-label-secondary">{description}</p>
    </section>
  )
}
