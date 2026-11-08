import { cn } from '@/lib/cn'

const SIZE_CLASSES = {
  page: 'py-16',
  section: 'py-8',
}

/**
 * What a screen shows when there is nothing in it yet, and what to do about it. The title
 * names the situation, the description says what comes next, and `action` is the button that
 * gets you there.
 *
 *     <EmptyState
 *       icon={CalendarRange}
 *       title="No hay un sprint activo"
 *       description="Iniciá un sprint planificado para ver su tablero."
 *       action={<Button>Ir a Sprints</Button>}
 *     />
 *
 * `size="section"` for an empty part of a page (a column, a panel); `page` for a whole screen.
 * For "loading" and "could not load" keep using LoadState.
 */
export function EmptyState({ icon: Icon, title, description, action, secondaryAction, size = 'page' }) {
  return (
    <div className={cn('flex flex-col items-center px-4 text-center', SIZE_CLASSES[size])}>
      {Icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-card bg-fill-tertiary text-label-secondary">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-title3 text-label">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-body text-label-secondary">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
