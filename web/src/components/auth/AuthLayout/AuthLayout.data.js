/* Each auth route links to the other one from the footer, instead of sharing a tab nav. */
export const FOOTERS = {
  '/register': {
    text: '¿Ya tenés una cuenta?',
    cta: 'Iniciar sesión',
    to: '/login',
  },
}

export const DEFAULT_FOOTER = {
  text: '¿No tenés una cuenta?',
  cta: 'Crear cuenta',
  to: '/register',
}
