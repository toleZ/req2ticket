import { TEXT } from './LoadState.styles'
import { cn } from '@/lib/cn'

/**
 * The three messages a page shows while it has nothing to list: "loading", "could not
 * load" with a retry button, and "nothing here yet".
 *
 * It does not wrap the content: once the data has loaded and there is something to show it
 * renders an empty live region, so the page puts it near the top and then renders its list
 * normally.
 *
 *     <LoadState
 *       state={loadState}
 *       isEmpty={epics.length === 0}
 *       loadingText="Cargando épicas…"
 *       errorText="No se pudieron cargar las épicas."
 *       emptyText="Todavía no hay épicas cargadas."
 *       onRetry={handleRetry}
 *     />
 */
export function LoadState({
  state,
  isEmpty,
  loadingText,
  errorText,
  emptyText,
  onRetry,
  className,
}) {
  /* The wrapper is a live region and is always rendered, empty once there is data. A live
     region only announces changes to something that was already on the page, so it cannot
     mount together with its first message. */
  let content = null

  if (state === 'loading') {
    /* Late on purpose: a load that finishes within 200ms never flashes its message. */
    content = <p className={cn(TEXT, 'mt-2 animate-fade-in-late', className)}>{loadingText}</p>
  } else if (state === 'error') {
    content = (
      <div className={cn('mt-2 flex items-center gap-3', className)}>
        <p className={TEXT}>{errorText}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-subheadline font-medium text-blue-text hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  } else if (isEmpty) {
    content = <p className={cn(TEXT, 'mt-2', className)}>{emptyText}</p>
  }

  return <div role="status">{content}</div>
}
