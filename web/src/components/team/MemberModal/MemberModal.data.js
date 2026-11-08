/* A new member starts as a developer: the role most of a team holds. */
export const NEW_MEMBER = {
  email: '',
  role: 'developer',
}

/* Where the focus goes when submit finds an error, keyed like validateMemberForm's result. */
export const FIELD_IDS = {
  email: 'member-email',
}

/* The API's two answers that are about the email, in the words the field shows. */
export const EMAIL_ERRORS = {
  'No user registered with that email.': 'No hay ningún usuario registrado con ese email',
  'User is already a member.': 'Ya es miembro de este proyecto',
}
