import { useEffect, useState } from 'react'
import { Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'

import { MobileDrawer } from '@/components/layout/MobileDrawer/MobileDrawer'
import { SidebarBody } from '@/components/layout/SidebarBody/SidebarBody'
import { TopBar } from '@/components/layout/TopBar/TopBar'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal/CreateProjectModal'
import { Toaster } from '@/components/ui/Toast/Toaster'
import { useTheme } from '@/hooks/useTheme'
import { CONTENT, MAIN, RAIL, RAIL_COLLAPSED, RAIL_EXPANDED, SHELL } from './AppShell.styles'
import { COLLAPSED_PREF } from './AppShell.data'
import { navBadges, projectPath, switchProjectPath } from '@/lib/navItems'
import { LAST_PROJECT_PREF } from '@/lib/projectPrefs'
import { useEpics } from '@/lib/queries/epics'
import { useMembers } from '@/lib/queries/members'
import { useProject, useProjects } from '@/lib/queries/projects'
import { useSprints } from '@/lib/queries/sprints'
import { useTickets } from '@/lib/queries/tickets'
import { readUiPref, writeUiPref } from '@/lib/uiPrefs'

export function AppShell() {
  /* The arrow matters: it runs readUiPref once, on mount, instead of on every render. */
  const [isCollapsed, setIsCollapsed] = useState(() => readUiPref(COLLAPSED_PREF, false))
  /* Never persisted — a drawer that is open on load is a bug, not a preference. */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  /* Here and nowhere else: the hook is the sole owner of the `dark` class on <html>. The
     login screens sit outside this tree and are covered by the script in index.html. */
  const { isDark, toggleTheme } = useTheme()

  /* Which project is open, read from the address (/p/R2T/…). The shell sits above the
     project's route, so it matches the address itself instead of reading useParams.
     Outside a project (Mi cuenta) the sidebar keeps the last project you opened — or the first
     one — so its card and its nav are still there to go back. */
  const projectKey = useMatch('/p/:projectKey/*')?.params.projectKey?.toUpperCase()
  const { data: projects = [] } = useProjects()
  const activeProjects = projects.filter((project) => !project.isArchived)
  const lastKey = readUiPref(LAST_PROJECT_PREF, null)
  const currentListed = projectKey
    ? projects.find((project) => project.key === projectKey)
    : (activeProjects.find((project) => project.key === lastKey) ?? activeProjects[0])
  const projectId = currentListed?.id
  const { data: project } = useProject(projectId)

  /* The same queries the pages use: the cache shares them, so the counts cost nothing extra. */
  const { data: tickets } = useTickets(projectId)
  const { data: epics } = useEpics(projectId)
  const { data: sprints } = useSprints(projectId)
  const { data: members } = useMembers(projectId)
  const badges = projectId ? navBadges({ tickets, epics, sprints, members }) : {}

  /* Every project, each marked if archived: the selector lists the active ones and folds the
     archived ones under "Archivados", so they can still be found and restored. The role is
     yours in it; a SuperAdmin outside the project sees "SuperAdmin". */
  const selectorProjects = projects.map((item) => ({
    id: item.id,
    code: item.key,
    name: item.name,
    role: item.myRole ?? 'superAdmin',
    isArchived: item.isArchived,
  }))

  function closeDrawer() {
    setIsDrawerOpen(false)
  }

  function handleSelectProject(selected) {
    navigate(switchProjectPath(pathname, selected.code))
  }

  function handleProjectCreated(created) {
    setIsCreateProjectOpen(false)
    navigate(projectPath(created.key))
  }

  /* An open drawer would cover the page it just navigated to. Links inside it close it
     through onNavigate, so the only navigation left is the browser back/forward gesture
     — and `popstate` is the browser event for exactly that. */
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

  const sidebarProps = {
    badges,
    projectKey: currentListed?.key ?? null,
    projects: selectorProjects,
    currentProjectId: projectId,
    onSelectProject: handleSelectProject,
    onCreateProject: () => setIsCreateProjectOpen(true),
  }

  return (
    <div className={SHELL}>
      <aside className={`${RAIL} ${isCollapsed ? RAIL_COLLAPSED : RAIL_EXPANDED}`}>
        <SidebarBody {...sidebarProps} isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      </aside>

      <MobileDrawer isOpen={isDrawerOpen} sidebarProps={sidebarProps} onClose={closeDrawer} />

      {/* min-w-0 is load-bearing: without it wide content pushes the rail off screen. */}
      <div className={CONTENT}>
        <TopBar
          project={project}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <main className={MAIN}>
          <Outlet context={{ openCreateProject: () => setIsCreateProjectOpen(true) }} />
        </main>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={handleProjectCreated}
      />

      <Toaster />
    </div>
  )
}
