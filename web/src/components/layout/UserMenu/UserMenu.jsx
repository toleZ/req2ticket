/* No hace falta leer esto para usar UserMenu: it is the row at the foot of the sidebar, and
   it only needs a way to close the drawer after navigating.

   Inside it is a menu button. The row opens a small menu (Ajustes, Cerrar sesión);
   the arrows move between its items, Escape closes it and returns to the row without closing
   the drawer around it, and focus or a click leaving the menu closes it too. In the collapsed
   rail it opens to the right, beside the avatar, instead of upwards. */
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar/Avatar'
import { clearSession, readSession } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { SETTINGS_ITEM } from '@/lib/navItems'
import { AVATAR_RING, CHEVRON, ITEM, MENU, TRIGGER, TRIGGER_COMPACT } from './UserMenu.styles'

export function UserMenu({ isCollapsed = false, onNavigate }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const user = readSession()?.user

  useEffect(() => {
    if (open) menuRef.current?.querySelector('[role=menuitem]')?.focus()
  }, [open])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleMenuKeyDown(e) {
    const items = [...menuRef.current.querySelectorAll('[role=menuitem]')]
    const index = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(index + 1) % items.length].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(index - 1 + items.length) % items.length].focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      items[0].focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1].focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="relative" onBlur={handleBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isCollapsed ? `Menú de ${user.name}` : undefined}
        title={isCollapsed ? user.name : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={isCollapsed ? TRIGGER_COMPACT : TRIGGER}
      >
        <Avatar name={user.name} size="md" className={isCollapsed ? AVATAR_RING : undefined} />
        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">{user.name}</span>
            <ChevronDown
              className={cn(CHEVRON, open && 'rotate-180')}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Menú de ${user.name}`}
          onKeyDown={handleMenuKeyDown}
          className={cn(MENU, isCollapsed ? 'bottom-0 left-full ml-2' : 'bottom-full left-0 mb-1.5')}
        >
          <Link
            to={SETTINGS_ITEM.to}
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
            className={ITEM}
          >
            <Settings className="size-4 text-label-secondary" aria-hidden="true" />
            {SETTINGS_ITEM.label}
          </Link>

          <div className="my-1 h-px bg-separator" role="separator" />

          <button type="button" role="menuitem" onClick={handleLogout} className={cn(ITEM, 'text-red-text')}>
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
