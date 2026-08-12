/* Único lugar que sabe dónde vive la sesión. El check "Mantener sesión" del login elige
   entre los dos storages, y esa elección es la que decide cuánto dura:

     localStorage   -> sobrevive cerrar el navegador
     sessionStorage -> muere al cerrar la pestaña

   Los dos tienen la misma interfaz, así que acá abajo es solo elegir el objeto. */
const STORAGE_KEY = 'app:session'

const STORAGES = () => [window.localStorage, window.sessionStorage]

function readFrom(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Modo privado, cuota llena, o un blob corrupto. Quedarse sin sesión manda al login,
    // que es mejor que romper el render.
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

/* Limpia los dos storages antes de escribir: si no, cambiar el check de una vez a la otra
   dejaría dos sesiones guardadas y readSession devolvería la vieja. */
export function saveSession(session, remember) {
  clearSession()

  try {
    const target = remember ? window.localStorage : window.sessionStorage
    target.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // La sesión queda solo en memoria: funciona hasta que se recargue la página.
  }
}

export function clearSession() {
  for (const storage of STORAGES()) {
    try {
      storage.removeItem(STORAGE_KEY)
    } catch {
      // Si no se puede borrar tampoco se pudo escribir, así que no hay nada que limpiar.
    }
  }
}

/* Devuelve null si no hay sesión o si el token ya venció. Mirar expiresAt acá evita mandar
   un token que ya sabemos muerto, y hace que vencerse se sienta igual que desloguearse. */
export function getToken() {
  const session = readSession()

  if (!session || !session.token) return null
  if (session.expiresAt && Date.parse(session.expiresAt) <= Date.now()) return null

  return session.token
}
