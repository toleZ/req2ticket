import { post } from './client'

export function login({ email, password }) {
  return post('/api/auth/login', { email: email.trim(), password })
}

/* Returns the same as login() — { token, expiresAt, user } — so the account is logged in as
   soon as it is created. If the email already exists, the API answers 409 and this throws. */
export function register({ name, email, password }) {
  return post('/api/auth/register', { name: name.trim(), email: email.trim(), password })
}
