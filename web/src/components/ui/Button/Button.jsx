import { cn } from '@/lib/cn'
import { BASE, SIZE_CLASSES, VARIANT_CLASSES } from './Button.styles'
/**
 * Every button in the app that carries a text label. The icon-only ones are `IconButton`.
 *
 * `type` defaults to "button" on purpose, which is the opposite of the HTML default. Inside a
 * <form> a bare <button> is a submit, so a Cancelar written without `type` would save instead
 * of closing — a bug this project hit more than once. The submit buttons ask for
 * `type="submit"` explicitly, which is the one place you want to see it written down.
 *
 * The classes go through `cn` so `className` can add a layout tweak (`lg:hidden`, a width) and
 * win against the base, rather than both landing in the DOM and letting the CSS order decide.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  ariaPressed,
  className,
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      className={cn(BASE, SIZE_CLASSES[size], VARIANT_CLASSES[variant], className)}
    >
      {children}
    </button>
  )
}
