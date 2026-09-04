import { Route, Routes } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout/AuthLayout'
import { RedirectIfAuth } from '@/components/auth/RedirectIfAuth/RedirectIfAuth'
import { RequireAuth } from '@/components/auth/RequireAuth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell/AppShell'
import { Board } from '@/pages/Board'
import { Home } from '@/pages/Home'
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
          <Route index element={<Home />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/board" element={<Board />} />
          <Route path="/epics" element={<Epics />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
