import { del, get, post, put } from './client'

/* The platform's user directory: SuperAdmin only (any other user gets 403). Each user is
   { id, name, email, platformRole }, platformRole being 'user' or 'superAdmin'. */
export function getUsers() {
  return get('/api/users')
}

export function createUser({ name, email, password, platformRole }) {
  return post('/api/users', { name: name.trim(), email: email.trim(), password, platformRole })
}

/* `password` empty leaves it as it is: the API never sends it back, so there is nothing to keep. */
export function updateUser(userId, { name, email, password, platformRole }) {
  return put(`/api/users/${userId}`, {
    name: name.trim(),
    email: email.trim(),
    password: password || null,
    platformRole,
  })
}

/* Refused for yourself, the last SuperAdmin and the only Admin of a project. */
export function deleteUser(userId) {
  return del(`/api/users/${userId}`)
}
