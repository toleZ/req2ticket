import { del, get, post, put } from './client'

export function getUsers() {
  return get('/api/users')
}

export function createUser(values) {
  return post('/api/users', {
    name: values.name,
    email: values.email,
    password: values.password,
    role: values.role,
  })
}

/* A full replacement, like the other PUTs, except for the password: the API leaves it alone
   when it is absent. `undefined` (not null or '') is what drops the key from the JSON. */
export function updateUser(id, values) {
  return put(`/api/users/${id}`, {
    name: values.name,
    email: values.email,
    password: values.password || undefined,
    role: values.role,
  })
}

export function deleteUser(id) {
  return del(`/api/users/${id}`)
}
