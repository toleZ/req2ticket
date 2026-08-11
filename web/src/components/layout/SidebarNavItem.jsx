import { Link, useMatch } from 'react-router-dom'

import { NavIndicator } from '@/components/layout/NavIndicator'

/* A CSS property may appear in the base OR in a state variant, never in both.
   See "Convención de clases" in README.md. */

/* px-3.75 is a constant in both states on purpose — see "Offsets" in README.md. */
const NAV_ITEM = `relative flex h-9 items-center gap-2.5 rounded-control px-3.75
  text-subheadline font-medium transition-colors duration-fast ease-out-quad`
const NAV_ITEM_ACTIVE = 'text-label'
const NAV_ITEM_IDLE = 'text-label-secondary hover:text-label'

const NAV_ICON = 'relative z-10 size-4.5 shrink-0'
const NAV_ICON_ACTIVE = 'text-blue'

const NAV_LABEL = 'relative z-10 whitespace-nowrap transition-opacity duration-fast ease-ios'

export function SidebarNavItem({ item, isCollapsed, indicatorId, onNavigate }) {
  const { to, label, icon: Icon, end } = item

  /* `end` decides whether child routes count as active. Without it on "/", Inicio would
     stay active on /tablero and two items would claim the highlight at once. */
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
