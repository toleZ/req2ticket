/* Único lugar que sabe hablar con la API. Los componentes llaman a las funciones de
   abajo y nunca usan fetch directo. */

import { clearSession, getToken } from '@/lib/auth'

const API_URL = 'http://localhost:5080'

const FALLBACK_ERROR = 'Algo salió mal. Probá de nuevo.'

/* La API contesta errores de dos formas: { message } cuando lo tira un service (401 del
   login, responsable inexistente) y el ProblemDetails de ASP.NET, con { errors }, cuando
   falla una validación de campo. Acá se reducen las dos a un string mostrable. */
function readError(body) {
  if (!body) return FALLBACK_ERROR

  if (body.message) return body.message

  if (body.errors) {
    const messages = Object.values(body.errors).flat()
    if (messages.length > 0) return messages[0]
  }

  return FALLBACK_ERROR
}

async function request(path, options = {}) {
  /* La API pide JWT en todo menos el login. El header se arma acá y no en post() para que
     también lo lleven los GET. */
  const token = getToken()
  const headers = { ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  let response

  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    // fetch solo rechaza si no hubo respuesta: API caída, DNS, CORS.
    throw new Error('No se pudo conectar con el servidor. ¿Está levantada la API?')
  }

  // Un 204 no trae cuerpo, y un 500 puede devolver HTML en vez de JSON.
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession()
      window.location.assign('/login')
    }

    throw new Error(readError(body))
  }

  return body
}

function post(path, payload) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

function put(path, payload) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

function del(path) {
  return request(path, { method: 'DELETE' })
}

export function login({ email, password }) {
  return post('/api/auth/login', { email: email.trim(), password })
}

export function getUsers() {
  return request('/api/users')
}

export function getEpics() {
  return request('/api/epics')
}

/* Traduce los valores del formulario al contrato de la API. El campo `body` del modal
   todavía no existe en el backend, así que no se envía. */
export function createEpic(values) {
  return post('/api/epics', {
    name: values.name,
    description: values.description || null,
    accentColor: values.accentColor,
    priority: values.priority,
    status: values.status,
    ownerId: values.ownerId ? Number(values.ownerId) : null,
  })
}

/* El PUT del backend reemplaza la épica entera, así que `patch` se mezcla sobre `epic`
   (la que ya tenemos en memoria) para no perder los campos que no cambiaron. */
export function updateEpic(epic, patch) {
  const merged = { ...epic, ...patch }
  return put(`/api/epics/${epic.id}`, {
    name: merged.name,
    description: merged.description || null,
    accentColor: merged.accentColor,
    priority: merged.priority,
    status: merged.status,
    ownerId: merged.ownerId ? Number(merged.ownerId) : null,
  })
}

export function deleteEpic(id) {
  return del(`/api/epics/${id}`)
}
