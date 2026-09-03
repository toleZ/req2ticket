import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PRIMARY_ITEMS, PROJECT_ITEMS, PROJECT_SECTION_LABEL } from '@/lib/navItems'
import { SidebarNavItem } from '@/components/layout/SidebarNavItem/SidebarNavItem'
import { BRAND_LINK, BRAND_ROW, BRAND_TILE, BRAND_WORDMARK, COLLAPSE_ROW, NAV, NAV_LIST, NAV_SECTION_HEADER } from './SidebarBody.styles'
import { IconButton } from '@/components/ui/IconButton/IconButton'

/* Every horizontal offset here is a constant, so the rail and the drawer line up. */

/* Fixed height so swapping the eyebrow for the rule does not shift the list below. */

/**
 * The brand row and the navigation. Rendered both inside the desktop rail and inside
 * the mobile drawer, which is why it owns no width, no border and no position.
 */
export function SidebarBody({ surface, isCollapsed = false, onToggleCollapse, onNavigate }) {
  /* One highlight per surface and per width. Why it has to be unique: NavIndicator.jsx. */
  const indicatorId = `nav-indicator-${surface}-${isCollapsed ? 'collapsed' : 'expanded'}`

  const collapseLabel = isCollapsed ? 'Expandir la barra lateral' : 'Contraer la barra lateral'

  return (
    <>
      {/* Always a link home, never the collapse control: a control hidden in the logo
          is a control nobody finds. */}
      <div className={BRAND_ROW}>
        <Link to="/" onClick={onNavigate} className={BRAND_LINK}>
          <span className={BRAND_TILE} aria-hidden="true">
            R2
          </span>
          <span className={`${BRAND_WORDMARK} ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            Req2Ticket
          </span>
        </Link>
      </div>

      <nav aria-label="Principal" className={NAV}>
        <ul className={NAV_LIST}>
          {PRIMARY_ITEMS.map((item) => (
            <li key={item.to}>
              <SidebarNavItem
                item={item}
                isCollapsed={isCollapsed}
                indicatorId={indicatorId}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        <div className={NAV_SECTION_HEADER}>
          {isCollapsed ? (
            /* w-4.5 is the icon width, so the rule sits in the icon column. */
            <span className="h-px w-4.5 bg-separator" aria-hidden="true" />
          ) : (
            <p className="eyebrow">{PROJECT_SECTION_LABEL}</p>
          )}
        </div>

        <ul className={NAV_LIST}>
          {PROJECT_ITEMS.map((item) => (
            <li key={item.to}>
              <SidebarNavItem
                item={item}
                isCollapsed={isCollapsed}
                indicatorId={indicatorId}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* At the foot of the rail, not in the brand row: the brand row keeps its own offset. */}
      {onToggleCollapse && (
        <div className={COLLAPSE_ROW}>
          <IconButton
            label={collapseLabel}
            title={collapseLabel}
            onClick={onToggleCollapse}
            ariaExpanded={!isCollapsed}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </IconButton>
        </div>
      )}
    </>
  )
}
