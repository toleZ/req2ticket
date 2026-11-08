import { motion } from 'motion/react'

import { springSnappy } from '@/lib/motion'

/* No hace falta leer esto para usarlo: draw it inside the selected option, and it slides to
   the next one when the selection moves. Two elements sharing a `layoutId` are one element to
   motion, so the pill travels between them with the same spring as the sidebar highlight.
   Give every group its own `layoutId` (useId), or two groups would trade pills. */
export function SelectionPill({ layoutId, className }) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={springSnappy}
      className={className}
      aria-hidden="true"
    />
  )
}
