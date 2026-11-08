import { get, put } from './client'

/* The account of whoever is logged in (/api/me) and the role catalog. */

export function getMe() {
  return get('/api/me')
}

export function updateMe({ name }) {
  return put('/api/me', { name: name.trim() })
}

export function changePassword({ currentPassword, newPassword }) {
  return put('/api/me/password', { currentPassword, newPassword })
}

/* [{ role, permissions: ['tickets.write', …] }], least to most privilege. */
export function getRoles() {
  return get('/api/roles')
}
