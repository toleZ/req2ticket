import { BASE, VARIANT_CLASSES } from './IconButton.styles'
import { cn } from '@/lib/cn'
/**
 * A square button whose only content is an icon: close, delete, collapse the rail, open the
 * drawer, switch the theme.
 *
 * `label` is required and becomes the aria-label. It is not optional decoration — to ARIA the
 * children of a <button> are decorative, so without it a screen reader announces "button" and
 * nothing else. `title` is separate because it shows a tooltip to sighted users, and only some
 * of these want one.
 *
 * The icon is passed as children so the caller picks its own lucide component and size, which
 * is not the same everywhere (size-4 for a bin, size-4.5 for a close cross).
 */
export function IconButton({
  label,
  title,
  variant = 'neutral',
  onClick,
  disabled = false,
  ariaExpanded,
  ariaControls,
  className,
  children,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      className={cn(BASE, VARIANT_CLASSES[variant], className)}
    >
      {children}
    </button>
  )
}
