import { Link, useMatch } from 'react-router-dom'

import { NavIndicator } from '@/components/layout/NavIndicator/NavIndicator'
import {
  NAV_BADGE,
  NAV_ICON,
  NAV_ICON_ACTIVE,
  NAV_ITEM,
  NAV_ITEM_ACTIVE,
  NAV_ITEM_IDLE,
  NAV_LABEL,
} from './SidebarNavItem.styles'

/* The label and the badge fade instead of unmounting when the rail collapses, so the row
   never reflows mid-animation; `title` names the item while only its icon shows. */
export function SidebarNavItem({ item, badge, isCollapsed, indicatorId, onNavigate }) {
  const { to, label, icon: Icon, end } = item
  const isActive = Boolean(useMatch({ path: to, end: Boolean(end) }))
  const faded = isCollapsed ? 'opacity-0' : 'opacity-100'

  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? label : undefined}
      className={`${NAV_ITEM} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`}
    >
      {isActive && <NavIndicator layoutId={indicatorId} />}

      <Icon className={`${NAV_ICON} ${isActive ? NAV_ICON_ACTIVE : ''}`} aria-hidden="true" />

      <span className={`${NAV_LABEL} ${faded}`}>{label}</span>

      {badge && (
        <span
          title={badge.title}
          className={`${NAV_BADGE} ${faded} ${badge.accent ? 'font-medium text-blue-text' : 'text-label-secondary'}`}
        >
          {badge.accent && <span className="size-1.5 rounded-full bg-blue" aria-hidden="true" />}
          {badge.text}
        </span>
      )}
    </Link>
  )
}
