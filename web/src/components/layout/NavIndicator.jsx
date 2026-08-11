import { motion } from 'motion/react'

import { springSnappy } from '@/lib/motion'

/**
 * The highlight behind the active nav item, which slides from one item to the next.
 *
 * You do not need to read past this line to add a page or a nav item — see navItems.js.
 *
 * How it slides: motion treats two elements sharing a `layoutId` as the SAME element
 * and animates between their positions. Only one item is active at a time, so the old
 * one unmounts, the new one mounts, and motion moves the pill between them.
 *
 * That is also why the id has to be unique per surface. Below lg the desktop rail is
 * `hidden lg:flex` — invisible, but still mounted. If the rail and the mobile drawer
 * used the same id, motion would see two live copies and fly the pill between two
 * surfaces you can never see at once. SidebarBody builds the id; it namespaces by
 * surface and by collapse state for the same reason.
 */
export function NavIndicator({ layoutId }) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={springSnappy}
      className="absolute inset-0 rounded-control bg-fill-tertiary"
      aria-hidden="true"
    />
  )
}
