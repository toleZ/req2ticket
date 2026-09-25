import { Button } from '@/components/ui/Button/Button'

/* How many rows a long list shows at first, and how many each "Mostrar más" adds. */
export const PAGE = 25

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
          className="min-h-11 text-footnote font-medium text-blue-text hover:underline lg:min-h-0"
        >
          Mostrar todos
        </button>
      )}
    </div>
  )
}
