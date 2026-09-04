import { Link, useMatch } from 'react-router-dom'

import { NavIndicator } from '@/components/layout/NavIndicator/NavIndicator'
import { NAV_ICON, NAV_ICON_ACTIVE, NAV_ITEM, NAV_ITEM_ACTIVE, NAV_ITEM_IDLE, NAV_LABEL } from './SidebarNavItem.styles'

/* A CSS property may appear in the base OR in a state variant, never in both. */

/* px-3.75 is a constant in both states on purpose: the label must not shift by a pixel
   when the item becomes active. */

export function SidebarNavItem({ item, isCollapsed, indicatorId, onNavigate }) {
  const { to, label, icon: Icon, end } = item

  /* `end` decides whether child routes count as active. Without it on "/", "Inicio" would
     stay active on /board and two items would claim the highlight at once. */
  const isActive = Boolean(useMatch({ path: to, end: Boolean(end) }))

  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      /* Collapsed, the label is clipped, so the mouse needs a tooltip. Screen readers
         do not: the text is still in the DOM, so it is still the link's name. */
      title={isCollapsed ? label : undefined}
      className={`${NAV_ITEM} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`}
    >
      {isActive && <NavIndicator layoutId={indicatorId} />}

      <Icon className={`${NAV_ICON} ${isActive ? NAV_ICON_ACTIVE : ''}`} aria-hidden="true" />

      {/* Fades instead of unmounting, so the row never reflows mid-animation. */}
      <span className={`${NAV_LABEL} ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{label}</span>
    </Link>
  )
}
