import { Navigate, Outlet } from 'react-router-dom'

import { getToken } from '@/lib/auth'

export function RedirectIfAuth() {
  if (getToken()) return <Navigate to="/" replace />

  return <Outlet />
}
