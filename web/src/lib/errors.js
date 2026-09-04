/* The message shown when we have nothing better to say. It lives here rather than in
   lib/api/client.js so that a component which only wants to display an error does not
   have to import from the module that talks to the network. */
export const FALLBACK_ERROR = 'Algo salió mal. Probá de nuevo.'

/* Everything the API layer throws is an Error, so `err.message` already carries the text
   the backend sent. The `instanceof` covers the odd case where something throws a
   different value (a string, an object) and keeps "undefined" off the screen. */
export function errorMessage(err) {
  return err instanceof Error ? err.message : FALLBACK_ERROR
}
