import { useEffect, useState } from 'react'

import { readUiPref, writeUiPref } from '@/lib/uiPrefs'

const THEME_PREF = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Owner of light/dark mode. Returns whether we are in dark and the function to switch it.
 *
 * The stored theme has three possible values:
 *   null              → follow the operating system (the starting point; never persisted)
 *   'light' | 'dark'  → the user chose by hand, and their choice beats the system
 *
 * All it does is add or remove the `dark` class on <html>. From there the CSS takes over:
 * the tokens in theme.css change value and the whole app follows. You never need to write
 * `dark:` in a component — see web/src/styles/README.md.
 *
 * Call it once, in AppShell. Two calls would be two separate states fighting each other.
 */
export function useTheme() {
  /* The arrow runs readUiPref once, on mount, instead of on every render. */
  const [theme, setTheme] = useState(() => readUiPref(THEME_PREF, null))
  const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  const isDark = theme === null ? systemIsDark : theme === 'dark'

  /* The user can change the OS appearance while the app is open. We listen at all times, not
     only while theme is null: as long as there is a manual choice the value just sits there
     unused, and that way the listener never has to be re-armed if we go back to following
     the system. */
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    function handleChange(event) {
      setSystemIsDark(event.matches)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  /* The class goes on <html> (document.documentElement), not on <body>: in theme.css the
     `:root` and `.dark` blocks target the same element and `.dark` wins by coming later in
     the file. Hung off <body> it would override nothing. */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  function toggleTheme() {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
    writeUiPref(THEME_PREF, next)
  }

  return { isDark, toggleTheme }
}
