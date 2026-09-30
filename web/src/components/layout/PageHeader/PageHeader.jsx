import { ACTIONS, HEADER, META, TITLE_ROW } from './PageHeader.styles'

/**
 * The title row every page starts with: the `<h1>`, a short count beside it in monospace
 * ("70 tickets · 151 pts"), and the page's search and buttons on the right.
 *
 * The search and buttons go in as children rather than as props, because each page has its
 * own: this file never has to know about them.
 *
 * `meta` is a string, not JSX — pass `null` while the page is still loading and it
 * disappears. Building the text as a string in the page body reads better than an
 * interpolation buried in the markup.
 */
export function PageHeader({ title, meta, children }) {
  return (
    <div className={HEADER}>
      <div className={TITLE_ROW}>
        <h1 className="text-title1 text-label">{title}</h1>
        {meta && <p className={META}>{meta}</p>}
      </div>
      {children && <div className={ACTIONS}>{children}</div>}
    </div>
  )
}
