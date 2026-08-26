import { post } from './client'

export function login({ email, password }) {
  return post('/api/auth/login', { email: email.trim(), password })
}

/* Devuelve lo mismo que login() — { token, expiresAt, user } — así que la cuenta queda
   logueada apenas se crea. Si el email ya existe, la API responde 409 y esto tira. */
export function register({ name, email, password }) {
  return post('/api/auth/register', { name: name.trim(), email: email.trim(), password })
}
