import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link, matchPath, useLocation } from 'react-router-dom'

import { NavIndicator } from '@/components/layout/NavIndicator/NavIndicator'
import { ProjectMenu } from '@/components/layout/ProjectMenu/ProjectMenu'
import { SidebarNavItem } from '@/components/layout/SidebarNavItem/SidebarNavItem'
import { UserMenu } from '@/components/layout/UserMenu/UserMenu'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { cn } from '@/lib/cn'
import { NAV_ITEMS, projectPath } from '@/lib/navItems'
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
 * With `projects`, the card is the project selector (ProjectMenu). Choosing another project
 * keeps the section (the caller navigates to the same page of the other project). Without
 * `projects`, the card is the plain link home. The nav links point into `projectKey` (on Mi
 * cuenta, the last project you opened); with no projects yet there is no nav to show.
 * The collapse control sits at the foot, beside the user (`onToggleCollapse`; the drawer
 * passes none, there is nothing to collapse there).
 */
export function SidebarBody({
  isCollapsed = false,
  badges = {},
  projectKey,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onToggleCollapse,
  onNavigate,
}) {
  const { pathname } = useLocation()
  // Which item the highlight sits behind, matched the same way SidebarNavItem marks itself
  // active; -1 on a page that is not in the list.
  const activeIndex = projectKey
    ? NAV_ITEMS.findIndex((item) =>
        Boolean(matchPath({ path: projectPath(projectKey, item.to), end: Boolean(item.end) }, pathname)),
      )
    : -1
  const collapseLabel = isCollapsed ? 'Expandir la barra lateral' : 'Contraer la barra lateral'

  const collapseControl = onToggleCollapse && (
    <IconButton
      label={collapseLabel}
      title={collapseLabel}
      onClick={onToggleCollapse}
      // Centred on the icons' line (54px into the rail) at both IconButton sizes: 44px wide
      // below lg needs a 2px inset, the 32px one from lg needs the avatar's 8px.
      className="ml-0.5 self-start lg:ml-2"
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
        {projects?.length ? (
          <ProjectMenu
            projects={projects}
            currentProjectId={currentProjectId}
            isCollapsed={isCollapsed}
            onSelectProject={onSelectProject}
            onCreateProject={onCreateProject}
            onNavigate={onNavigate}
          />
        ) : (
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
              <span className={cn(CARD_ROLE, 'block')}>Sin proyectos</span>
            </span>
          </Link>
        )}
      </div>

      <nav aria-label="Principal" className={NAV}>
        {projectKey && (
          /* The wrapper is the frame the highlight moves in: it starts at the list's top edge,
             and a <span> may not sit directly inside a <ul>. */
          <div className="relative">
            <NavIndicator index={activeIndex} />
            <ul className={NAV_LIST}>
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <SidebarNavItem
                    item={item}
                    to={projectPath(projectKey, item.to)}
                    badge={item.badge ? badges[item.badge] : null}
                    isCollapsed={isCollapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
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
