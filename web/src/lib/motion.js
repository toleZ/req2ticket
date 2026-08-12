/* Shared animation values, so two components never disagree on how fast something
   moves. Only what is actually used lives here — add a token when you add its use. */

/** iOS curve: fast start, long settle. Mirrors --ease-ios in theme.css. */
export const EASE_IOS = [0.32, 0.72, 0, 1]

/** Panels entering in place: the mobile drawer sliding in, a modal scaling up. */
export const springSoft = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }

/** The active nav highlight moving between items. */
export const springSnappy = { type: 'spring', stiffness: 480, damping: 34, mass: 0.7 }
