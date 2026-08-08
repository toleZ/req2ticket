const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * @param {{ fullName: string, email: string, password: string, confirmPassword: string }} values
 * @returns {{ [field: string]: string }}
 */
export function validateRegisterForm(values) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Enter your full name.'
  }

  if (!values.email.trim()) {
    errors.email = 'Enter your email.'
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Enter a password.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}
