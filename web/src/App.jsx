import { Navigate, Route, Routes } from 'react-router-dom'

import { Account } from '@/pages/Account'
import { AuthLayout } from '@/components/auth/AuthLayout/AuthLayout'
import { RedirectIfAuth } from '@/components/auth/RedirectIfAuth/RedirectIfAuth'
import { RequireAuth } from '@/components/auth/RequireAuth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell/AppShell'
import { HomeRedirect } from '@/components/projects/HomeRedirect/HomeRedirect'
import { ProjectGate } from '@/components/projects/ProjectGate/ProjectGate'
import { Board } from '@/pages/Board'
import { Epics } from '@/pages/Epics'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { Register } from '@/pages/Register'
import { Settings } from '@/pages/Settings'
import { Sprints } from '@/pages/Sprints'
import { Tickets } from '@/pages/Tickets'
import { Summary } from '@/pages/Summary'
import { Team } from '@/pages/Team'

/* Every page of the work lives inside a project, under /p/<KEY>/… (the key is the address, so
   a link to /p/R2T/board opens that project's board for anyone in it). "/" goes to the last
   project used. Mi cuenta (/account) is outside any project: it is yours, not the project's,
   and someone in no project yet can reach it too. */
export function App() {
  return (
    <Routes>
      <Route element={<RedirectIfAuth />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<HomeRedirect />} />
          <Route path="/account" element={<Account />} />
          <Route path="/settings" element={<Navigate to="/account" replace />} />

          <Route path="/p/:projectKey" element={<ProjectGate />}>
            <Route index element={<Summary />} />
            <Route path="board" element={<Board />} />
            <Route path="backlog" element={<Tickets />} />
            <Route path="tickets" element={<Navigate to="../backlog" replace />} />
            <Route path="epics" element={<Epics />} />
            <Route path="sprints" element={<Sprints />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Inside the shell, so a wrong address keeps the sidebar and the way back. Signed
              out, RequireAuth sends it to the login first, like any other page. */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
