import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { MobileDrawer } from '@/components/layout/MobileDrawer'
import { SidebarBody } from '@/components/layout/SidebarBody'
import { TopBar } from '@/components/layout/TopBar'
import { useTheme } from '@/hooks/useTheme'
import { readUiPref, writeUiPref } from '@/lib/uiPrefs'

const RAIL = `material-regular hairline-r sticky top-0 z-20 hidden h-screen shrink-0
  flex-col overflow-hidden transition-[width] duration-base ease-ios lg:flex`
const RAIL_EXPANDED = 'w-62'
const RAIL_COLLAPSED = 'w-17'

const SHELL = 'flex min-h-screen bg-base'
const CONTENT = 'flex min-w-0 flex-1 flex-col'
const MAIN = 'flex-1 px-4 py-6 md:px-6 lg:px-8'

const COLLAPSED_PREF = 'sidebarCollapsed'

export function AppShell() {
  /* The arrow matters: it runs readUiPref once, on mount, instead of on every render. */
  const [isCollapsed, setIsCollapsed] = useState(() => readUiPref(COLLAPSED_PREF, false))
  /* Never persisted — a drawer that is open on load is a bug, not a preference. */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  /* Here and nowhere else: the hook is the sole owner of the `dark` class on <html>. The
     login screens sit outside this tree and are covered by the script in index.html. */
  const { isDark, toggleTheme } = useTheme()

  function closeDrawer() {
    setIsDrawerOpen(false)
  }

  /* An open drawer would cover the page it just navigated to. Links inside it close it
     through onNavigate, so the only navigation left is the browser back/forward gesture
     — and `popstate` is the browser event for exactly that.

     The handler is declared in here on purpose: using `closeDrawer`, which is a new
     function on every render, would mean listing it as a dependency, and the listener
     would unsubscribe and resubscribe constantly. */
  useEffect(() => {
    function handlePopState() {
      setIsDrawerOpen(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function handleToggleCollapse() {
    const next = !isCollapsed
    setIsCollapsed(next)
    writeUiPref(COLLAPSED_PREF, next)
  }

  return (
    <div className={SHELL}>
      <aside className={`${RAIL} ${isCollapsed ? RAIL_COLLAPSED : RAIL_EXPANDED}`}>
        <SidebarBody
          surface="rail"
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* min-w-0 is load-bearing: without it wide content pushes the rail off screen. */}
      <div className={CONTENT}>
        <TopBar
          onOpenDrawer={() => setIsDrawerOpen(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <main className={MAIN}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
