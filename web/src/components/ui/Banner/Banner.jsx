import { cn } from '@/lib/cn'
import { BASE, BODY, ICON_CLASSES, TITLE, TONE_CLASSES } from './Banner.styles'

/**
 * A strip that explains the state of what you are looking at, above it: "Proyecto archivado:
 * solo lectura", "Épica cerrada: reabrila para hacer cambios". It is not an error (that is
 * FormError) and not news (that is a toast): it stays as long as the state lasts.
 *
 *     <Banner tone="warning" icon={Lock} title="Épica cerrada" action={<Button size="sm">Reabrir</Button>}>
 *       Reabrila para hacer cambios en sus tickets.
 *     </Banner>
 *
 * Tones: `neutral` for a state (archived, read only), `info` for a note, `warning` for
 * something that blocks the actions you would expect.
 */
export function Banner({ tone = 'neutral', icon: Icon, title, action, className, children }) {
  return (
    <div className={cn(BASE, TONE_CLASSES[tone], className)}>
      {Icon && <Icon className={cn('mt-0.5 size-4.5 shrink-0', ICON_CLASSES[tone])} aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        {title && <p className={TITLE}>{title}</p>}
        {children && <p className={BODY}>{children}</p>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  )
}
