/* The project card at the top of the sidebar, as a menu button. It shows the current project
   (its Key on the brand tile, its name and your role in it) and opens the list of your
   projects. Below the list: "Configuración del proyecto" (the current one's settings) and
   "Nuevo proyecto", when the caller handles it.

   Like the user menu: Escape closes it and returns to the card, and focus or a click leaving
   the menu closes it too. */
import { useRef, useState } from 'react'
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { SETTINGS_ITEM, projectPath } from '@/lib/navItems'
import { ROLE_LABELS } from '@/lib/options'
import {
  CHECK,
  CHEVRON,
  ITEM,
  ITEM_ADD_TILE,
  ITEM_TEXT,
  ITEM_TILE,
  MENU,
  MENU_BELOW,
  MENU_BESIDE,
  NAME,
  ROLE,
  TILE,
  TRIGGER,
  TRIGGER_BARE,
  TRIGGER_BARE_OPEN,
  TRIGGER_FRAME,
  TRIGGER_TEXT,
} from './ProjectMenu.styles'

export function ProjectMenu({
  projects,
  currentProjectId,
  isCollapsed = false,
  onSelectProject,
  onCreateProject,
  onNavigate,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const current = projects.find((project) => project.id === currentProjectId) ?? projects[0]
  const role = ROLE_LABELS[current.role]

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  // Escape closes only the menu: stopPropagation keeps the mobile drawer around it open.
  function handleKeyDown(e) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      close()
    }
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  function handleSelect(project) {
    close()
    // Picking the project you are already in is not a change: no refetch, drawer stays open.
    if (project.id === current.id) return
    onSelectProject?.(project)
    onNavigate?.()
  }

  function handleCreate() {
    setOpen(false)
    onCreateProject()
    onNavigate?.()
  }

  return (
    <div className="relative" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        title={isCollapsed ? current.name : undefined}
        onClick={() => setOpen(!open)}
        className={cn(TRIGGER, isCollapsed ? TRIGGER_BARE : TRIGGER_FRAME, isCollapsed && open && TRIGGER_BARE_OPEN)}
      >
        <span className={TILE} aria-hidden="true">
          {current.code}
        </span>
        <span className={cn(TRIGGER_TEXT, isCollapsed && 'opacity-0')}>
          <span className={NAME}>{current.name}</span>
          {role && <span className={ROLE}>{role}</span>}
        </span>
        <ChevronsUpDown className={cn(CHEVRON, isCollapsed && 'opacity-0')} aria-hidden="true" />
      </button>

      {open && (
        <div
          // The click must not move the focus first, or handleBlur closes the menu before it lands.
          onMouseDown={(e) => e.preventDefault()}
          className={cn(MENU, isCollapsed ? MENU_BESIDE : MENU_BELOW)}
        >
          {projects.map((project) => {
            const isCurrent = project.id === current.id
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => handleSelect(project)}
                className={ITEM}
              >
                <span className={ITEM_TILE} aria-hidden="true">
                  {project.code}
                </span>
                <span className={ITEM_TEXT}>
                  <span className={NAME}>{project.name}</span>
                  {ROLE_LABELS[project.role] && <span className={ROLE}>{ROLE_LABELS[project.role]}</span>}
                </span>
                {isCurrent && <Check className={CHECK} aria-hidden="true" />}
              </button>
            )
          })}

          <div className="my-1 h-px bg-separator" />
          <Link
            to={projectPath(current.code, SETTINGS_ITEM.to)}
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
            className={ITEM}
          >
            <span className={ITEM_ADD_TILE} aria-hidden="true">
              <Settings className="size-4" />
            </span>
            <span className={cn(ITEM_TEXT, 'text-subheadline text-label')}>{SETTINGS_ITEM.label}</span>
          </Link>

          {onCreateProject && (
            <>
              <button type="button" onClick={handleCreate} className={ITEM}>
                <span className={ITEM_ADD_TILE} aria-hidden="true">
                  <Plus className="size-4" />
                </span>
                <span className={cn(ITEM_TEXT, 'text-subheadline text-label')}>Nuevo proyecto</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
