import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link, matchPath, useLocation } from 'react-router-dom'

import { NavIndicator } from '@/components/layout/NavIndicator/NavIndicator'
import { SidebarNavItem } from '@/components/layout/SidebarNavItem/SidebarNavItem'
import { UserMenu } from '@/components/layout/UserMenu/UserMenu'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { readSession } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { NAV_ITEMS } from '@/lib/navItems'
import { ROLE_LABELS } from '@/lib/options'
import { SHORTCUT } from './SidebarBody.data'
import {
  BRAND_TILE,
  CARD,
  CARD_FRAME,
  CARD_NAME,
  CARD_ROLE,
  CARD_ROW,
  CARD_TEXT,
  NAV,
  NAV_LIST,
  USER_ROW,
} from './SidebarBody.styles'

/**
 * What the rail and the mobile drawer both show: the project card, the nav with its counts,
 * and the user row with its menu. `badges` comes from navBadges() in lib/navItems.js.
 *
 * The card links to Resumen; there is one project for now, so there is nothing to switch to.
 * The collapse control sits at the foot, beside the user (`onToggleCollapse`; the drawer
 * passes none, there is nothing to collapse there).
 */
export function SidebarBody({
  isCollapsed = false,
  badges = {},
  onToggleCollapse,
  onNavigate,
}) {
  const { pathname } = useLocation()
  // Which item the highlight sits behind, matched the same way SidebarNavItem marks itself
  // active; -1 on a page that is not in the list.
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    Boolean(matchPath({ path: item.to, end: Boolean(item.end) }, pathname)),
  )
  const role = ROLE_LABELS[readSession()?.user?.role]
  const collapseLabel = isCollapsed ? 'Expandir la barra lateral' : 'Contraer la barra lateral'

  const collapseControl = onToggleCollapse && (
    <IconButton
      label={collapseLabel}
      title={`${collapseLabel} (${SHORTCUT})`}
      onClick={onToggleCollapse}
      ariaExpanded={!isCollapsed}
      className="ml-2 self-start"
    >
      {isCollapsed ? (
        <PanelLeftOpen className="size-4.5" aria-hidden="true" />
      ) : (
        <PanelLeftClose className="size-4.5" aria-hidden="true" />
      )}
    </IconButton>
  )

  return (
    <>
      <div className={CARD_ROW}>
        <Link
          to="/"
          onClick={onNavigate}
          title={isCollapsed ? 'Req2Ticket' : undefined}
          className={cn(CARD, !isCollapsed && CARD_FRAME)}
        >
          <span className={BRAND_TILE} aria-hidden="true">
            REQ
          </span>
          <span className={cn(CARD_TEXT, isCollapsed && 'opacity-0')}>
            <span className={cn(CARD_NAME, 'block')}>Req2Ticket</span>
            {role && <span className={cn(CARD_ROLE, 'block')}>{role}</span>}
          </span>
        </Link>
      </div>

      <nav aria-label="Principal" className={NAV}>
        {/* The wrapper is the frame the highlight moves in: it starts at the list's top edge,
            and a <span> may not sit directly inside a <ul>. */}
        <div className="relative">
          <NavIndicator index={activeIndex} />
          <ul className={NAV_LIST}>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <SidebarNavItem
                  item={item}
                  badge={item.badge ? badges[item.badge] : null}
                  isCollapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className={USER_ROW}>
        {collapseControl}
        <div className="min-w-0">
          <UserMenu isCollapsed={isCollapsed} onNavigate={onNavigate} />
        </div>
      </div>
    </>
  )
}
