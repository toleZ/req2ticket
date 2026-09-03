export const SCRIM = 'fixed inset-0 z-40 bg-scrim'

/* What the two sizes share. Watch what is NOT here: padding and overflow are exactly what
   tells them apart, so they live in SIZE_CLASSES. Repeating them up here and overriding them
   below would not work — this string is concatenated by hand, without twMerge, so both
   classes would reach the DOM together and the CSS would decide the winner, not us. */
export const PANEL_BASE = `fixed inset-4 z-50 m-auto max-h-[calc(100dvh-2rem)] w-full rounded-sheet
  bg-elevated shadow-popover surface-highlight ring-[0.5px] ring-separator focus:outline-none`

export const SIZE_CLASSES = {
  /* The usual one. `h-fit` keeps a short modal short, and `max-h` + `overflow-y-auto` stop a
     long one from running off screen: creating a bug is fourteen fields, and without this the
     Crear button sits below the fold with no way to reach it. `inset-4` is the margin, so the
     maximum is the screen minus those two. */
  md: 'h-fit max-w-md overflow-y-auto p-6',

  /* The one for the detail modals. The sheet does not scroll: its columns do, which is why
     it is `overflow-hidden` and not `overflow-y-auto`. It draws no padding either, because
     inside there is a header bar, two columns and a footer that all reach the edge. */
  lg: 'flex h-fit max-w-4xl flex-col overflow-hidden',
}
