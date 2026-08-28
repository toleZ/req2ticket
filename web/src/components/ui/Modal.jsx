import { useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

import { useFocusTrap } from '@/hooks/useFocusTrap'
import { EASE_IOS, springSoft } from '@/lib/motion'

const SCRIM = 'fixed inset-0 z-40 bg-scrim'

/* Lo que comparten los dos tamaños. Ojo con lo que NO está acá: el padding y el overflow son
   justo lo que los diferencia, así que viven en SIZE_CLASSES. Repetirlos arriba y pisarlos
   abajo no funcionaría — este string se concatena a mano, sin twMerge, así que las dos
   clases llegarían juntas al DOM y ganaría la que el CSS dicte, no la que escribimos. */
const PANEL_BASE = `fixed inset-4 z-50 m-auto max-h-[calc(100dvh-2rem)] w-full rounded-sheet
  bg-elevated shadow-popover surface-highlight ring-[0.5px] ring-separator focus:outline-none`

const SIZE_CLASSES = {
  /* El de siempre. `h-fit` deja corto un modal corto, y `max-h` + `overflow-y-auto` evitan
     que uno largo se pase de la pantalla: el alta de un bug son catorce campos, y sin esto
     el botón Crear queda abajo del pliegue sin forma de llegar. `inset-4` es el margen, así
     que el máximo es la pantalla menos esos dos. */
  md: 'h-fit max-w-md overflow-y-auto p-6',

  /* El de los modales de detalle. No scrollea la hoja: scrollean sus columnas, y por eso
     va `overflow-hidden` en vez de `overflow-y-auto`. Tampoco dibuja padding, porque adentro
     hay una barra de cabecera, dos columnas y un pie que llegan hasta el borde. */
  lg: 'flex h-fit max-w-4xl flex-col overflow-hidden',
}

const CLOSE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-secondary
  transition-colors duration-fast ease-out-quad hover:bg-fill-tertiary hover:text-label
  disabled:opacity-50`

/**
 * La hoja modal: scrim, panel, foco atrapado y animación de entrada y salida.
 *
 * Dos tamaños. `md` (el de siempre) dibuja su propia barra de título a partir de `title` y
 * deja el contenido en `children`. `lg` no dibuja nada: el que lo usa pinta su cabecera, su
 * cuerpo y su pie, y le pasa `ariaLabel` en vez de `title` para que el diálogo siga teniendo
 * nombre accesible.
 */
export function Modal({ isOpen, onClose, title, ariaLabel, size = 'md', children }) {
  const titleId = useId()
  const panelRef = useFocusTrap(isOpen, onClose)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={SCRIM}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_IOS }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            /* Con `title` el nombre sale del <h2> de abajo; sin él, del texto que le pasen.
               Un diálogo sin ninguno de los dos se anuncia como "diálogo" y nada más. */
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : ariaLabel}
            tabIndex={-1}
            className={`${PANEL_BASE} ${SIZE_CLASSES[size]}`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={springSoft}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 id={titleId} className="text-title3 text-label">
                  {title}
                </h2>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={onClose}
                  className={CLOSE_BUTTON}
                >
                  <X className="size-4.5" aria-hidden="true" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
