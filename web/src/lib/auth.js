/* The only place that knows where the session lives. The login's "Mantener sesión"
   checkbox picks between the two storages, and that choice is what decides how long it
   lasts:

     localStorage   -> survives closing the browser
     sessionStorage -> dies when the tab closes

   Both expose the same interface, so everything below is just picking the object. */
const STORAGE_KEY = 'app:session'

const STORAGES = () => [window.localStorage, window.sessionStorage]

function readFrom(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Private mode, a full quota, or a corrupt blob. Ending up with no session sends the
    // user to the login screen, which beats breaking the render.
    return null
  }
}

export function readSession() {
  for (const storage of STORAGES()) {
    const session = readFrom(storage)
    if (session) return session
  }

  return null
}

/* Clears both storages before writing: otherwise toggling the checkbox between one visit
   and the next would leave two saved sessions, and readSession would return the stale one. */
export function saveSession(session, remember) {
  clearSession()

  try {
    const target = remember ? window.localStorage : window.sessionStorage
    target.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // The session only lives in memory now: it works until the page is reloaded.
  }
}

export function clearSession() {
  for (const storage of STORAGES()) {
    try {
      storage.removeItem(STORAGE_KEY)
    } catch {
      // If it cannot be removed then it could not be written either, so there is nothing
      // to clean up.
    }
  }
}

/* Returns null when there is no session or the token has already expired. Checking
   expiresAt here avoids sending a token we already know is dead, and makes expiring feel
   exactly like logging out. */
export function getToken() {
  const session = readSession()

  if (!session || !session.token) return null
  if (session.expiresAt && Date.parse(session.expiresAt) <= Date.now()) return null

  return session.token
}
