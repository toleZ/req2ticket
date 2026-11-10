import { PASSWORD_RULES } from '@/components/ui/Field/PasswordRules.data'

// Any valid-looking address (ENT-6): something@domain.tld. .com.ar and .io are fine too. The
// API checks it again; this only warns early.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function emailError(email, emptyMessage = 'Ingresá tu email') {
  const trimmed = email.trim()

  if (!trimmed) return emptyMessage
  if (!EMAIL_RE.test(trimmed)) return 'Ingresá un email válido'
  if (trimmed.length > 120) return 'El email puede tener hasta 120 caracteres'

  return undefined
}

/* For a password someone chooses (registro, Mi cuenta): the same four rules the API checks,
   listed under the field by PasswordField showRules. The first one that fails is the message. */
export function newPasswordError(password, emptyMessage = 'Ingresá una contraseña') {
  if (!password) return emptyMessage
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password))
  return failed ? `La contraseña necesita: ${failed.label.toLowerCase()}` : undefined
}

export function validateRegisterForm(values) {
  const errors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Ingresá tu nombre completo'
  } else if (name.length < 2 || name.length > 80) {
    errors.name = 'El nombre tiene que tener entre 2 y 80 caracteres'
  }

  const email = emailError(values.email)
  if (email) errors.email = email

  const password = newPasswordError(values.password)
  if (password) errors.password = password

  if (!password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
  }

  return errors
}

/* Logging in only asks that something was typed (ENT-6): the strength rules are for creating a
   password, and a format error here would hint at which half of the credentials was wrong. */
export function validateLoginForm(values) {
  const errors = {}

  if (!values.email.trim()) errors.email = 'Ingresá tu email'
  if (!values.password) errors.password = 'Ingresá tu contraseña'

  return errors
}

/* Same limits as the API (ENT-6): name 3 to 120, description up to 2000. */
export function validateEpicForm(values) {
  const errors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Ingresá un nombre para la épica'
  } else if (name.length < 3 || name.length > 120) {
    errors.name = 'El nombre tiene que tener entre 3 y 120 caracteres'
  }

  if ((values.description ?? '').length > 2000) {
    errors.description = 'La descripción no puede pasar los 2000 caracteres'
  }

  return errors
}

/* The same rules as the API (ENT-2, ENT-6), so the form says it before the round trip. The keys
   are the form's: `title`, `parentId`, and the type's fields by their own name
   (`stepsToReproduce`) — the form puts each message under its field. */
export function validateTicketForm(values) {
  const errors = {}
  const title = values.title.trim()

  if (!title) {
    errors.title = 'Ingresá un título para el ticket'
  } else if (title.length < 3 || title.length > 160) {
    errors.title = 'El título tiene que tener entre 3 y 160 caracteres'
  }

  // A bug without steps cannot be worked on.
  if (values.type === 'bug' && !values.typeFields?.stepsToReproduce?.trim()) {
    errors.stepsToReproduce = 'Contá cómo reproducirlo'
  }

  // A fix always repairs a bug.
  if (values.type === 'fix' && !values.parentId) {
    errors.parentId = 'Elegí el bug que arregla'
  }

  return errors
}

/* Adding someone to the project: they have to be registered already, so only their email and
   the role. `takenEmails` are the current members' addresses, already lowercase: the API would
   refuse a repeat anyway, but only after the round trip. */
export function validateMemberForm(values, takenEmails) {
  const errors = {}
  const email = values.email.trim().toLowerCase()

  const emailMessage = emailError(email, 'Ingresá el email de la persona')
  if (emailMessage) {
    errors.email = emailMessage
  } else if (takenEmails.includes(email)) {
    errors.email = 'Ya es miembro de este proyecto'
  }

  if (!values.role) errors.role = 'Elegí un rol'

  return errors
}

/* A user created or edited by a SuperAdmin (Administración): the same rules as the registration.
   Editing, the password may stay empty — that keeps the current one. */
export function validateUserForm(values, isEditing) {
  const errors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Ingresá el nombre'
  } else if (name.length < 2 || name.length > 80) {
    errors.name = 'El nombre tiene que tener entre 2 y 80 caracteres'
  }

  const email = emailError(values.email, 'Ingresá el email')
  if (email) errors.email = email

  if (!isEditing || values.password) {
    const password = newPasswordError(values.password)
    if (password) errors.password = password
  }

  return errors
}

/* Same limits as the API (ENT-6, ENT-5): name 3 to 120, goal up to 500, capacity a whole number
   from 0 to 999, and the end not before the start. */
export function validateSprintForm(values) {
  const errors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Ingresá un nombre para el sprint'
  } else if (name.length < 3 || name.length > 120) {
    errors.name = 'El nombre tiene que tener entre 3 y 120 caracteres'
  }

  if ((values.goal ?? '').length > 500) {
    errors.goal = 'La meta no puede pasar los 500 caracteres'
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

  const capacity = Number(values.capacity)
  if (values.capacity === '' || !Number.isInteger(capacity) || capacity < 0 || capacity > 999) {
    errors.capacity = 'Ingresá una capacidad de 0 a 999 puntos'
  }

  return errors
}
