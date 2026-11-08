/* The rules of ENT-6, the same ones the API checks. The front repeats them to warn early;
   the API is still the one that says no. */
export const PASSWORD_RULES = [
  { id: 'length', label: 'Entre 8 y 72 caracteres', test: (value) => value.length >= 8 && value.length <= 72 },
  { id: 'upper', label: 'Una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Un número', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'Un carácter especial', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

/* For the submit button of a form that creates a password. */
export function passwordMeetsRules(value) {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}
