import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PRIMARY_ITEMS, PROJECT_ITEMS, PROJECT_SECTION_LABEL } from '@/components/layout/navItems'
import { SidebarNavItem } from '@/components/layout/SidebarNavItem'

/* Every horizontal offset here is a constant — see "Offsets" in README.md. */
const BRAND_ROW = 'flex h-14 shrink-0 items-center pr-3.5 pl-5'
const BRAND_LINK = 'flex items-center gap-2.5'
const BRAND_TILE = `brand-tile grid size-7 shrink-0 place-items-center rounded-lg
  font-display text-caption font-extrabold text-white`
const BRAND_WORDMARK = `font-display whitespace-nowrap text-title3 text-label
  transition-opacity duration-fast ease-ios`

const NAV = 'flex flex-1 flex-col overflow-y-auto px-2.5 pb-3'
const NAV_LIST = 'flex flex-col gap-0.5'

/* Fixed height so swapping the eyebrow for the rule does not shift the list below. */
const NAV_SECTION_HEADER = 'flex h-10 shrink-0 items-end px-3.75 pb-1'

const COLLAPSE_ROW = 'flex shrink-0 items-center py-2 pl-4.5'
const COLLAPSE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control
  text-label-secondary transition-colors duration-fast ease-out-quad
  hover:bg-fill-tertiary hover:text-label`

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

      {/* At the foot of the rail, not in the brand row — see "Offsets" in README.md. */}
      {onToggleCollapse && (
        <div className={COLLAPSE_ROW}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapseLabel}
            title={collapseLabel}
            aria-expanded={!isCollapsed}
            className={COLLAPSE_BUTTON}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </>
  )
}
