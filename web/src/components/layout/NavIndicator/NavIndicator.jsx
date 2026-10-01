import { cn } from '@/lib/cn'
import { ITEM_PITCH } from './NavIndicator.data'
import { PILL, PILL_HIDDEN } from './NavIndicator.styles'

/**
 * The highlight behind the active nav item, which slides from one item to the next.
 *
 * You do not need to read past this line to add a page or a nav item — see navItems.js.
 *
 * There is one pill per list, and it sits at `index` × the distance between items, moved by a
 * CSS transition. It used to be motion's shared `layoutId`, which measures where the old and
 * the new item are against the page. The rail is sticky, so against the page its items sat
 * wherever the window was scrolled to: leave a long page from its foot and the pill flew up
 * from thousands of pixels below. Counting items instead of measuring them, the page's scroll
 * has nothing to do with it.
 *
 * `index` is -1 when the page is not in the list (Ajustes): the pill fades out in place.
 */
export function NavIndicator({ index }) {
  const isShown = index >= 0

  return (
    <span
      aria-hidden="true"
      className={cn(PILL, !isShown && PILL_HIDDEN)}
      style={isShown ? { transform: `translateY(${index * ITEM_PITCH}px)` } : undefined}
    />
  )
}
