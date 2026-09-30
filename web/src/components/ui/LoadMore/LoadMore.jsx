import { Button } from '@/components/ui/Button/Button'
import { PAGE } from './LoadMore.data'
import { SHOW_ALL } from './LoadMore.styles'

/**
 * The foot of a long list that shows it a page at a time: "Mostrar 25 más", how many are shown
 * of how many, and "Mostrar todos" while more than a page is left. The list keeps `shown` in
 * its own state and renders only that many rows; this draws nothing once all of them show.
 */
export function LoadMore({ shown, total, onMore, onAll }) {
  const remaining = total - shown
  if (remaining <= 0) return null

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <Button variant="neutral" size="sm" onClick={onMore}>
        Mostrar {Math.min(PAGE, remaining)} más
      </Button>
      <span className="text-footnote text-label-secondary">
        {shown} de {total} · quedan {remaining}
      </span>
      {remaining > PAGE && (
        <button
          type="button"
          onClick={onAll}
          className={SHOW_ALL}
        >
          Mostrar todos
        </button>
      )}
    </div>
  )
}
