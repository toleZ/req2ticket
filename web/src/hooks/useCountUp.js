import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * A number that counts to `target` instead of jumping there. Used by the breakdown's big
 * percentage, so it climbs while the bar under it draws itself (same duration as
 * --animate-wipe-in in theme.css), and slides from 41 to 47 when a ticket is done while the
 * panel is open.
 *
 * It starts at 0, so the first count runs from nothing. Each later run starts from whatever
 * the number shows at that moment — if `target` changes mid-count it carries on from there
 * instead of restarting.
 *
 * With reduced motion it returns `target` as is: the figure is the information, the count is
 * only the movement.
 */
export function useCountUp(target, duration = 560) {
  const [value, setValue] = useState(0)
  const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches

  useEffect(() => {
    if (isReduced) return undefined

    let frame
    let startTime = null
    let from = null

    function step(time) {
      if (startTime === null) startTime = time
      const progress = Math.min(1, (time - startTime) / duration)
      // Ease-out quart: fast at first, settling at the end, close to the bar's --ease-ios.
      const eased = 1 - Math.pow(1 - progress, 4)

      // The number on screen when this run began is read here, from the state itself, the
      // first time the step runs.
      setValue((current) => {
        if (from === null) from = current
        return from + (target - from) * eased
      })

      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, isReduced])

  return isReduced ? target : Math.round(value)
}
