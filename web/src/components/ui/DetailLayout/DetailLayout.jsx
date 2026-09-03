import { BODY, MAIN_COL, SIDE_COL } from './DetailLayout.styles'
/* Mobile: a single column and the sheet scrolls. From md up: two columns, each scrolling on
   its own, which is what Modal's `lg` size is for (see the SIZE_CLASSES comment there).
   `min-h-0` is not decorative: a flex child starts at `min-height: auto`, refuses to get any
   smaller than its content, and the overflow never gets a chance to kick in. */

/* The separator changes sides at md because the columns go from stacked to side by side. It
   uses `border` and not the `hairline-*` utilities: those pin a 0.5px edge with no variant to
   switch it off, and switching the top one off at md is exactly what is needed here. */
/**
 * The two-column body of a detail sheet: the content on the left, the metadata on the right.
 *
 * `children` is the main column and `side` the narrow one, rather than both being props, so
 * the call site reads as "this is the sheet's content, and this is what sits beside it".
 */
export function DetailLayout({ side, children }) {
  return (
    <div className={BODY}>
      <div className={MAIN_COL}>{children}</div>
      <div className={SIDE_COL}>{side}</div>
    </div>
  )
}
