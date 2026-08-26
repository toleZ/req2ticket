/* The only place that knows how to talk to the network: the base URL, the token header,
   how an error is read, and the four verbs everything else is built on.

   Nothing outside lib/api/ imports this file. The entity modules next to it wrap these
   helpers, and components reach those through '@/lib/api' — that is what keeps fetch out
   of the components. */

import { clearSession, getToken } from '@/lib/auth'
import { FALLBACK_ERROR } from '@/lib/errors'

const API_URL = 'http://localhost:5080'

/* The four verbs, and the whole point of this file: every function in epics.js,
   stories.js and the rest is one of these plus a path. */

export function get(path) {
  return send('GET', path)
}

export function post(path, payload) {
  return send('POST', path, payload)
}

export function put(path, payload) {
  return send('PUT', path, payload)
}

/* `del` and not `delete` because `delete` is a reserved word in JavaScript. */
export function del(path) {
  return send('DELETE', path)
}

/* Everything below is the plumbing behind those four. send() is the whole trip; the
   helpers under it are the fiddly parts pulled out so send() stays readable. */

/* Sends the request and returns the parsed body. When anything goes wrong it throws an
   Error whose `message` is already the text to show on screen — that is what
   errorMessage() in lib/errors.js expects, and what every catch in the components reads. */
async function send(method, path, payload) {
  // Read once: the 401 check below needs to know whether we actually sent a token.
  const token = getToken()

  let response

  try {
    response = await fetch(`${API_URL}${path}`, buildOptions(method, payload, token))
  } catch {
    // fetch only rejects when there was no response at all: API down, DNS, CORS.
    throw new Error('No se pudo conectar con el servidor. ¿Está levantada la API?')
  }

  const body = await readBody(response)

  if (!response.ok) {
    /* A dead token: drop the session and start over at the login. Only when we actually
       sent one — a wrong password answers 401 too, and there the user has to stay on the
       page to read the message. */
    if (response.status === 401 && token) {
      clearSession()
      window.location.assign('/login')
    }

    throw new Error(readError(body))
  }

  return body
}

/* fetch's second argument. A GET or a DELETE has no payload and sends no body; the rest
   send JSON and have to say so in the header. */
function buildOptions(method, payload, token) {
  const headers = {}

  if (token) headers.Authorization = `Bearer ${token}`

  if (payload === undefined) return { method, headers }

  headers['Content-Type'] = 'application/json'

  return { method, headers, body: JSON.stringify(payload) }
}

/* A 204 (what DELETE answers) carries no body at all, and a 500 sometimes answers with an
   HTML error page instead of JSON. Both make response.json() throw, and in both cases
   "there is no body" is the right answer — so the failure is swallowed on purpose. */
async function readBody(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/* The API reports errors in two shapes: { message } when a service throws it (a 401 from
   the login, a missing owner) and ASP.NET's ProblemDetails, with { errors }, when a field
   validation fails. This reduces both to one displayable string. */
function readError(body) {
  if (!body) return FALLBACK_ERROR

  if (body.message) return body.message

  if (body.errors) {
    const messages = Object.values(body.errors).flat()
    if (messages.length > 0) return messages[0]
  }

  return FALLBACK_ERROR
}
