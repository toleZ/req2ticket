/**
 * The title row every page starts with: the `<h1>`, an optional line of context under it,
 * and the page's action buttons on the right.
 *
 * The buttons go in as children rather than as props, because they are not all the same
 * shape: Tickets has two of them and one is a toggle carrying `aria-pressed`. Passing
 * them in means each page writes its own buttons, with its own labels and handlers, and
 * this file never has to know about them.
 *
 *     <PageHeader title="Sprints" subtitle={subtitle}>
 *       <button type="button" onClick={…} className={PRIMARY_BUTTON}>Nuevo sprint</button>
 *     </PageHeader>
 *
 * `subtitle` is a string, not JSX — pass `null` while the page is still loading and it
 * disappears. Building the text as a string in the page body reads better than an
 * interpolation buried in the markup.
 */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-title1 text-label">{title}</h1>
        {subtitle && <p className="mt-1 text-footnote text-label-secondary">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  )
}
