/* Same size and tint as an item, laid behind the list (the items' icon and text are z-10).
   It moves with transform only, so the slide never touches layout; with reduced motion
   index.css narrows transitions to colour and opacity and it lands at once. */
export const PILL = `pointer-events-none absolute inset-x-0 top-0 h-9 rounded-control bg-blue/12
  transition-[transform,opacity] duration-base ease-ios`

/* On a page that is not in the list (Ajustes) the pill fades out where it was. */
export const PILL_HIDDEN = 'opacity-0'
