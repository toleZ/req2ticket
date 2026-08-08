// Requires a "@" and a ".com" domain, per product rule — not a general RFC email check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.com$/i
const MIN_PASSWORD_LENGTH = 6
const UPPERCASE_RE = /[A-Z]/
const NUMBER_RE = /[0-9]/
const SPECIAL_CHAR_RE = /[^A-Za-z0-9]/

/**
 * @param {{ email: string, password: string }} values
 * @returns {{ [field: string]: string }} error messages, keyed by field
 */
export function validateLoginForm(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Ingresá tu email'
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Ingresá un email válido que termine en .com'
  }

  if (!values.password) {
    errors.password = 'Ingresá tu contraseña'
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
  } else if (!UPPERCASE_RE.test(values.password)) {
    errors.password = 'La contraseña debe tener al menos una mayúscula'
  } else if (!NUMBER_RE.test(values.password)) {
    errors.password = 'La contraseña debe tener al menos un número'
  } else if (!SPECIAL_CHAR_RE.test(values.password)) {
    errors.password = 'La contraseña debe tener al menos un carácter especial'
  }

  return errors
}
