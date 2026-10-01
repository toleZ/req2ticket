import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { MobileDrawer } from '@/components/layout/MobileDrawer/MobileDrawer'
import { SidebarBody } from '@/components/layout/SidebarBody/SidebarBody'
import { TopBar } from '@/components/layout/TopBar/TopBar'
import { useProjectData } from '@/hooks/useProjectData'
import { useTheme } from '@/hooks/useTheme'
import { CONTENT, MAIN, RAIL, RAIL_COLLAPSED, RAIL_EXPANDED, SHELL, SKIP_LINK } from './AppShell.styles'
import { COLLAPSED_PREF } from './AppShell.data'
import { navBadges } from '@/lib/navItems'
import { readUiPref, writeUiPref } from '@/lib/uiPrefs'

export function AppShell() {
  /* The arrow matters: it runs readUiPref once, on mount, instead of on every render. */
  const [isCollapsed, setIsCollapsed] = useState(() => readUiPref(COLLAPSED_PREF, false))
  /* Never persisted — a drawer that is open on load is a bug, not a preference. */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  /* Here and nowhere else: the hook is the sole owner of the `dark` class on <html>. The
     login screens sit outside this tree and are covered by the script in index.html. */
  const { isDark, toggleTheme } = useTheme()

  /* Loaded here, once, because this component survives the navigation between pages while the
     thing under <Outlet /> does not. Every page below reads it with useOutletContext(). */
  const projectData = useProjectData()
  const badges = navBadges(projectData)

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

  /* Moves the focus by hand instead of following the #contenido link: a hash navigation
     would change the URL and fire the popstate listener above. */
  function handleSkipToContent(e) {
    e.preventDefault()
    document.getElementById('contenido')?.focus()
  }

  /* ⌘\ on a Mac, Ctrl+\ elsewhere: the usual shortcut for showing or hiding a sidebar. The
     handler reads the stored preference instead of `isCollapsed`, so the listener never needs
     to be re-added when the state changes. */
  useEffect(() => {
    function handleShortcut(e) {
      if (e.key !== '\\' || !(e.metaKey || e.ctrlKey)) return
      e.preventDefault()
      const next = !readUiPref(COLLAPSED_PREF, false)
      setIsCollapsed(next)
      writeUiPref(COLLAPSED_PREF, next)
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  function handleToggleCollapse() {
    const next = !isCollapsed
    setIsCollapsed(next)
    writeUiPref(COLLAPSED_PREF, next)
  }

  return (
    <div className={SHELL}>
      <a href="#contenido" onClick={handleSkipToContent} className={SKIP_LINK}>
        Saltar al contenido
      </a>

      <aside className={`${RAIL} ${isCollapsed ? RAIL_COLLAPSED : RAIL_EXPANDED}`}>
        <SidebarBody
          isCollapsed={isCollapsed}
          badges={badges}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      <MobileDrawer
        isOpen={isDrawerOpen}
        badges={badges}
        onClose={closeDrawer}
      />

      {/* min-w-0 is load-bearing: without it wide content pushes the rail off screen. */}
      <div className={CONTENT}>
        <TopBar
          onOpenDrawer={() => setIsDrawerOpen(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <main id="contenido" tabIndex={-1} className={MAIN}>
          <Outlet context={projectData} />
        </main>
      </div>
    </div>
  )
}
