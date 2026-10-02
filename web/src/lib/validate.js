// Requires a "@" and a ".com" domain, per product rule — not a general RFC email check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.com$/i
const MIN_LOGIN_PASSWORD_LENGTH = 6
// The API demands at least 8 (see RegisterRequest.cs): validating 6 here would let through a
// form the backend rejects anyway.
const MIN_REGISTER_PASSWORD_LENGTH = 8
// BCrypt ignores everything past 72 bytes, so the API refuses longer ones.
const MAX_PASSWORD_LENGTH = 72
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

export function validateTicketForm(values) {
  const errors = {}

  if (!values.title.trim()) {
    errors.title = 'Ingresá un título para el ticket'
  }

  if (!values.epicId) {
    errors.epicId = 'Elegí una épica'
  }

  return errors
}

/* Creating or editing someone else's account, so the messages do not say "tu". The password
   only asks for the API's length (8 to 72, see UserCreateRequest.cs): the strength rules of the
   sign-up are for a password you choose yourself, not one an admin hands over to be changed.
   Editing, an empty password means "leave it as it is".

   `takenEmails` are the other members' addresses, already lowercase: the API would refuse a
   repeat anyway, but in English and only after the round trip. */
export function validateMemberForm(values, isNew, takenEmails) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim().toLowerCase()

  if (!name) {
    errors.name = 'Ingresá nombre y apellido'
  } else if (name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
  }

  if (!email) {
    errors.email = 'Ingresá el email'
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Ingresá un email válido que termine en .com'
  } else if (takenEmails.includes(email)) {
    errors.email = 'Ya hay un integrante con ese email'
  }

  if (isNew && !values.password) {
    errors.password = 'Ingresá una contraseña'
  } else if (values.password && values.password.length < MIN_REGISTER_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_REGISTER_PASSWORD_LENGTH} caracteres`
  } else if (values.password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `La contraseña puede tener hasta ${MAX_PASSWORD_LENGTH} caracteres`
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
