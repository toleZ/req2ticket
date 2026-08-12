// Requires a "@" and a ".com" domain, per product rule — not a general RFC email check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.com$/i
const MIN_PASSWORD_LENGTH = 6
const UPPERCASE_RE = /[A-Z]/
const NUMBER_RE = /[0-9]/
const SPECIAL_CHAR_RE = /[^A-Za-z0-9]/

function emailError(email) {
  const trimmed = email.trim()

  if (!trimmed) return 'Ingresá tu email'
  if (!EMAIL_RE.test(trimmed)) return 'Ingresá un email válido que termine en .com'

  return undefined
}

function passwordError(password) {
  if (!password) return 'Ingresá tu contraseña'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
  }
  if (!UPPERCASE_RE.test(password)) return 'La contraseña debe tener al menos una mayúscula'
  if (!NUMBER_RE.test(password)) return 'La contraseña debe tener al menos un número'
  if (!SPECIAL_CHAR_RE.test(password)) {
    return 'La contraseña debe tener al menos un carácter especial'
  }

  return undefined
}

export function validateRegisterForm(values) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Ingresá tu nombre completo'
  }

  const email = emailError(values.email)
  if (email) errors.email = email

  return errors
}

export function validateLoginForm(values) {
  const errors = {}

  const email = emailError(values.email)
  if (email) errors.email = email

  const password = passwordError(values.password)
  if (password) errors.password = password

  return errors
}

export function validateEpicForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Ingresá un nombre para la épica'
  }

  return errors
}
