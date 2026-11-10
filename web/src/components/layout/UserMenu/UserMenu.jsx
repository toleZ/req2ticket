/* No hace falta leer esto para usar UserMenu: it is the row at the foot of the sidebar, and
   it only needs a way to close the drawer after navigating.

   Inside: the row opens a small menu (Mi cuenta, Cerrar sesión). Escape closes it without
   closing the drawer around it, and focus or a click leaving the menu closes it too. In the
   collapsed rail it opens to the right, beside the avatar, instead of upwards. */
import { useRef, useState } from 'react'
import { ChevronDown, CircleUser, LogOut, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar/Avatar'
import { readSession } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { ACCOUNT_ITEM, ADMIN_ITEM } from '@/lib/navItems'
import { PLATFORM_SUPER_ADMIN } from '@/lib/options'
import { signOut } from '@/lib/queries/session'
import { AVATAR_RING, CHEVRON, ITEM, MENU, TRIGGER, TRIGGER_COMPACT } from './UserMenu.styles'

/* Mi cuenta is yours, not the project's: the same page from any project. The project's own
   settings open from the project menu, at the top of the sidebar. */
export function UserMenu({ isCollapsed = false, onNavigate }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const navigate = useNavigate()
  const user = readSession()?.user

  // Escape closes only the menu: stopPropagation keeps the mobile drawer around it open.
  function handleKeyDown(e) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  // signOut also empties the data cache, so the next person on this tab sees nothing of yours.
  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="relative" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={isCollapsed ? `Menú de ${user.name}` : undefined}
        title={isCollapsed ? user.name : undefined}
        onClick={() => setOpen(!open)}
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
          // The click must not move the focus first, or handleBlur closes the menu before it lands.
          onMouseDown={(e) => e.preventDefault()}
          className={cn(MENU, isCollapsed ? 'bottom-0 left-full ml-2' : 'bottom-full left-0 mb-1.5')}
        >
          <Link
            to={`/${ACCOUNT_ITEM.to}`}
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
            className={ITEM}
          >
            <CircleUser className="size-4 text-label-secondary" aria-hidden="true" />
            {ACCOUNT_ITEM.label}
          </Link>

          {user.platformRole === PLATFORM_SUPER_ADMIN && (
            <Link
              to={`/${ADMIN_ITEM.to}`}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={ITEM}
            >
              <Shield className="size-4 text-label-secondary" aria-hidden="true" />
              {ADMIN_ITEM.label}
            </Link>
          )}

          <div className="my-1 h-px bg-separator" />

          <button type="button" onClick={handleLogout} className={cn(ITEM, 'text-red-text')}>
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
