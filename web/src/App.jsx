import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout/AuthLayout'
import { RedirectIfAuth } from '@/components/auth/RedirectIfAuth/RedirectIfAuth'
import { RequireAuth } from '@/components/auth/RequireAuth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell/AppShell'
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
          <Route index element={<Summary />} />
          <Route path="/summary" element={<Navigate to="/" replace />} />
          <Route path="/board" element={<Board />} />
          <Route path="/epics" element={<Epics />} />
          <Route path="/backlog" element={<Tickets />} />
          <Route path="/tickets" element={<Navigate to="/backlog" replace />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
          {/* Inside the shell, so a wrong address keeps the sidebar and the way back. Signed
              out, RequireAuth sends it to the login first, like any other page. */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
