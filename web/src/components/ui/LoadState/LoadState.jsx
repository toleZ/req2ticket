import { TEXT } from './LoadState.styles'
import { cn } from '@/lib/cn'

/**
 * The three messages a page shows while it has nothing to list: "loading", "could not
 * load" with a retry button, and "nothing here yet".
 *
 * It does not wrap the content: it returns `null` once the data has loaded and there is
 * something to show, so the page puts it near the top and then renders its list normally.
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
  if (state === 'loading') {
    return <p className={cn(TEXT, 'mt-2', className)}>{loadingText}</p>
  }

  if (state === 'error') {
    return (
      <div className={cn('mt-2 flex items-center gap-3', className)}>
        <p className={TEXT}>{errorText}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-subheadline font-medium text-blue hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (isEmpty) {
    return <p className={cn(TEXT, 'mt-2', className)}>{emptyText}</p>
  }

  return null
}
