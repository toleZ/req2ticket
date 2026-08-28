/* Generic helper for option lists. It lives here instead of in epicOptions.js because
   tickets and sprints use it too, and "import epicOptions to render a sprint" confuses
   more than it helps. */
export function findOption(options, value) {
  return options.find((option) => option.value === value)
}
