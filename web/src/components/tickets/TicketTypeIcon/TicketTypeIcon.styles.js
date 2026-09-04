/* The tone comes from TICKET_TYPE_OPTIONS, but the colour class has to be written out in
   full: Tailwind reads the code as text and would never see a `text-${tone}`. Same reason
   ACCENT_COLORS in lib/epicOptions.js stores `dotClass` and not the colour's name. */
export const TONE_CLASSES = {
  blue: 'text-blue',
  teal: 'text-teal',
  red: 'text-red',
  green: 'text-green',
}
