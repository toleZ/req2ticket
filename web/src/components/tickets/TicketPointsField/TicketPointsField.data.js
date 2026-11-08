/* The design's scale, with the dash ("sin estimar") up front. The dash is drawn for 0 and
   travels as '' — the API stores null for an unestimated ticket, and 0 would claim the work was
   estimated as nothing. */
export const POINTS_SCALE = [0, 1, 2, 3, 5, 8, 13]
