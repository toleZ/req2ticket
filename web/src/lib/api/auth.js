import { post } from './client'

export function login({ email, password }) {
  return post('/api/auth/login', { email: email.trim(), password })
}
