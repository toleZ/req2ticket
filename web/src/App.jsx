import { Route, Routes } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { Register } from '@/pages/Register'

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
