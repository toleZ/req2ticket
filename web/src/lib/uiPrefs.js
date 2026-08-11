/* One namespaced blob for every interface preference, so a second writer does not
   have to re-derive the parsing. `useTheme` will store its key here too. */
const STORAGE_KEY = 'app:ui'

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    // Private mode, a full quota, or a corrupt blob. A preference is never worth
    // failing a render over.
    return {}
  }
}

export function readUiPref(key, fallback) {
  const stored = readAll()[key]
  /* Compared against undefined, not checked for truthiness: `false` is a valid stored
     value, and a falsy check would make a collapsed sidebar impossible to remember. */
  return stored === undefined ? fallback : stored
}

export function writeUiPref(key, value) {
  try {
    const all = readAll()
    all[key] = value
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // The preference is lost for this session only; nothing else reads it back.
  }
}
