import { cn } from '@/lib/cn'

/* La escala del diseño, con el 0 adelante. El 0 no es un caso raro que haya que tolerar: el
   modal de alta manda `Number(points) || 0`, así que todo ticket creado sin estimar llega
   con cero. Tiene que ser un valor elegible, no algo que el control no sepa dibujar. */
const POINTS_SCALE = [0, 1, 2, 3, 5, 8, 13]

const GROUP = 'flex flex-wrap gap-1 rounded-control bg-fill-tertiary p-1'

const CHIP = `min-w-7 rounded-control px-1.5 py-0.5 text-caption font-medium text-label-secondary
  transition-colors duration-fast ease-out-quad hover:text-label disabled:opacity-50`

/* El elegido sube de superficie en vez de pintarse de azul. Es el mismo recurso que usa el
   resto de la app para decir "esto está activo" sin gastar el acento, que acá ya lo tienen
   la prioridad y el estado. */
const CHIP_ON = 'bg-elevated text-label shadow-hairline'

/**
 * Los puntos de un ticket, como la tira segmentada del diseño.
 *
 * `value` y `onChange` trabajan con strings, igual que un <input>: la conversión a número
 * pasa una sola vez, en lib/api/tickets.js, y así este control se comporta como cualquier
 * otro campo del formulario que lo contiene.
 */
export function TicketPointsField({ id, value, disabled, onChange }) {
  const current = Number(value)

  /* Puntos es un entero libre en la API: nada impide un 4 o un 21 cargados desde otro lado.
     Si el valor actual no está en la escala se agrega al final en vez de perderse — una tira
     que no puede mostrar lo que el ticket tiene hoy haría que abrir el modal y guardar sin
     tocar nada le cambiara los puntos en silencio. */
  const scale = POINTS_SCALE.includes(current) ? POINTS_SCALE : [...POINTS_SCALE, current]

  return (
    <div id={id} className={GROUP} role="radiogroup" aria-label="Puntos">
      {scale.map((point) => (
        <button
          key={point}
          type="button"
          role="radio"
          aria-checked={current === point}
          aria-label={point === 0 ? 'Sin estimar' : `${point} puntos`}
          disabled={disabled}
          onClick={() => onChange(String(point))}
          className={cn(CHIP, current === point && CHIP_ON)}
        >
          {/* El 0 se dibuja como un guión: "0 puntos" y "sin estimar" son lo mismo acá, y el
              guión lo dice sin que haya que leer un número que no significa nada. */}
          {point === 0 ? '–' : point}
        </button>
      ))}
    </div>
  )
}
