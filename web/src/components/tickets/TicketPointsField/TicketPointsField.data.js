/* The design's scale, with 0 up front. The 0 is not an odd case to be tolerated: the create
   modal sends `Number(points) || 0`, so every ticket created without an estimate arrives at
   zero. It has to be a selectable value, not something the control cannot draw. */
export const POINTS_SCALE = [0, 1, 2, 3, 5, 8, 13]
