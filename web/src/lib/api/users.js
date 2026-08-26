import { get } from './client'

export function getUsers() {
  return get('/api/users')
}
