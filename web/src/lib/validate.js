// Requires a "@" and a ".com" domain, per product rule — not a general RFC email check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.com$/i
const MIN_LOGIN_PASSWORD_LENGTH = 6
// La API exige mínimo 8 (ver RegisterRequest.cs): validar 6 acá dejaría pasar un form que
// el backend rechaza igual.
const MIN_REGISTER_PASSWORD_LENGTH = 8
const UPPERCASE_RE = /[A-Z]/
const NUMBER_RE = /[0-9]/
const SPECIAL_CHAR_RE = /[^A-Za-z0-9]/

function emailError(email) {
  const trimmed = email.trim()

  if (!trimmed) return 'Ingresá tu email'
  if (!EMAIL_RE.test(trimmed)) return 'Ingresá un email válido que termine en .com'

  return undefined
}

function passwordError(password, minLength) {
  if (!password) return 'Ingresá tu contraseña'
  if (password.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`
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

  if (!values.name.trim()) {
    errors.name = 'Ingresá tu nombre completo'
  }

  const email = emailError(values.email)
  if (email) errors.email = email

  const password = passwordError(values.password, MIN_REGISTER_PASSWORD_LENGTH)
  if (password) errors.password = password

  if (!password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
  }

  return errors
}

export function validateLoginForm(values) {
  const errors = {}

  const email = emailError(values.email)
  if (email) errors.email = email

  const password = passwordError(values.password, MIN_LOGIN_PASSWORD_LENGTH)
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

export function validateStoryForm(values) {
  const errors = {}

  if (!values.title.trim()) {
    errors.title = 'Ingresá un título para la historia'
  }

  if (!values.epicId) {
    errors.epicId = 'Elegí una épica'
  }

  return errors
}

export function validateSprintForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Ingresá un nombre para el sprint'
  }

  if (!values.startDate) {
    errors.startDate = 'Ingresá la fecha de inicio'
  }

  if (!values.endDate) {
    errors.endDate = 'Ingresá la fecha de fin'
  }

  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = 'La fecha de fin no puede ser anterior a la de inicio'
  }

  if (values.capacity === '' || Number(values.capacity) < 0) {
    errors.capacity = 'Ingresá una capacidad válida'
  }

  return errors
}
