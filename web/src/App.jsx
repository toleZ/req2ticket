import { Route, Routes } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { AppShell } from '@/components/layout/AppShell'
import { Board } from '@/pages/Board'
import { Dashboard } from '@/pages/Dashboard'
import { Features } from '@/pages/Features'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { Register } from '@/pages/Register'
import { Settings } from '@/pages/Settings'
import { Sprints } from '@/pages/Sprints'
import { Stories } from '@/pages/Stories'
import { Summary } from '@/pages/Summary'
import { Team } from '@/pages/Team'

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="/resumen" element={<Summary />} />
        <Route path="/tablero" element={<Board />} />
        <Route path="/funcionalidades" element={<Features />} />
        <Route path="/historias" element={<Stories />} />
        <Route path="/sprints" element={<Sprints />} />
        <Route path="/equipo" element={<Team />} />
        <Route path="/ajustes" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
