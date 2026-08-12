import { useEffect, useState } from 'react'

import { readUiPref, writeUiPref } from '@/lib/uiPrefs'

const THEME_PREF = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Dueño del modo claro/oscuro. Devuelve si estamos en oscuro y la función para cambiarlo.
 *
 * El tema guardado tiene tres valores posibles:
 *   null              → seguir al sistema operativo (el arranque; nunca se guarda)
 *   'light' | 'dark'  → el usuario eligió a mano, y su elección gana sobre el sistema
 *
 * Lo único que hace es poner o sacar la clase `dark` de <html>. De ahí en adelante el CSS se
 * encarga solo: los tokens de theme.css cambian de valor y con eso cambia toda la app. No hace
 * falta escribir `dark:` en ningún componente — ver web/src/styles/README.md.
 *
 * Llamalo una sola vez, en AppShell. Dos llamadas serían dos estados separados que se pisarían.
 */
export function useTheme() {
  /* La flecha corre readUiPref una sola vez, al montar, en vez de en cada render. */
  const [theme, setTheme] = useState(() => readUiPref(THEME_PREF, null))
  const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  const isDark = theme === null ? systemIsDark : theme === 'dark'

  /* El usuario puede cambiar la apariencia del SO con la app abierta. Escuchamos siempre, no
     solo cuando theme es null: mientras haya una elección manual el valor queda ahí sin usarse,
     y así no hay que rearmar el listener si algún día se vuelve a "seguir al sistema". */
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    function handleChange(event) {
      setSystemIsDark(event.matches)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  /* La clase va en <html> (document.documentElement), no en <body>: en theme.css los bloques
     `:root` y `.dark` apuntan al mismo elemento y `.dark` gana por venir después en el archivo.
     Colgada del <body> no pisaría nada. */
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
