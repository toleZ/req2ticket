/* The only place that knows how to talk to the network: the base URL, the token header,
   how an error is read, and the four verbs everything else is built on.

   Nothing outside lib/api/ imports this file. The entity modules next to it (epics.js,
   tickets.js…) wrap these helpers, and the hooks in lib/queries/ import those directly:
   `import { getSprints } from '@/lib/api/sprints'`. Components use the hooks, never these
   functions — that is what keeps fetch out of the components. The two exceptions are the
   login and register pages, which call auth.js directly: there is nothing to cache there. */

import { clearSession, getToken } from '@/lib/auth'
import { FALLBACK_ERROR } from '@/lib/errors'

/* Vite replaces this with the literal URL when it builds, so it is fixed per build, not read
   while the app runs. Locally it comes from .env.development; in Azure the deploy workflow sets
   it for each environment. It ends up in the public JS, so it must never hold a secret. */
const API_URL = import.meta.env.VITE_API_URL

/* The five verbs, and the whole point of this file: every function in epics.js,
   tickets.js and the rest is one of these plus a path. */

export function get(path) {
  return send('GET', path)
}

export function post(path, payload) {
  return send('POST', path, payload)
}

export function put(path, payload) {
  return send('PUT', path, payload)
}

export function patch(path, payload) {
  return send('PATCH', path, payload)
}

/* `del` and not `delete` because `delete` is a reserved word in JavaScript. */
export function del(path) {
  return send('DELETE', path)
}

/* What every failed request throws. `message` is already the text to show on screen (what
   errorMessage() in lib/errors.js reads), and two extras for the screens that need them:

     status       the HTTP status, or 0 when the server could not be reached. The query
                  client reads it to decide whether retrying makes sense (a 404 never will).
     fieldErrors  { title: 'Title is required.', 'bug.stepsToReproduce': '…' } when the API
                  rejected specific fields, so a form can put each message under its field.
                  The keys are the same names the form sends. */
export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/* Everything below is the plumbing behind those verbs. send() is the whole trip; the
   helpers under it are the fiddly parts pulled out so send() stays readable. */

/* Sends the request and returns the parsed body, or throws an ApiError. */
async function send(method, path, payload) {
  // Read once: the 401 check below needs to know whether we actually sent a token.
  const token = getToken()

  let response

  try {
    response = await fetch(`${API_URL}${path}`, buildOptions(method, payload, token))
  } catch {
    // fetch only rejects when there was no response at all: API down, DNS, CORS.
    throw new ApiError('No se pudo conectar con el servidor. ¿Está levantada la API?', 0)
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

    throw new ApiError(readError(body), response.status, readFieldErrors(body))
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

/* ProblemDetails' `errors` as { field: firstMessage }. ASP.NET prefixes JSON errors with "$."
   ("$.title"); dropping it leaves the same name the form sent. The "$" key alone is a broken
   body, not a field, and stays out. */
function readFieldErrors(body) {
  if (!body?.errors) return {}

  const fields = {}
  Object.entries(body.errors).forEach(([key, messages]) => {
    const field = key.replace(/^\$\.?/, '')
    if (field && messages.length > 0) fields[field] = messages[0]
  })
  return fields
}
