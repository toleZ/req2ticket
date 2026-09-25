/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
export const INITIAL_VALUES = { email: '', password: '', remember: false }

/* Demo account credentials: LoginForm's demo button fills them in for the user.

   Every seeded account shares this password and the email is the role in lowercase
   (admin@, productowner@, scrummaster@, developer@, superadmin@), so switching roles
   while developing means editing the local part of what this button typed. See
   api/src/Infrastructure/SeedData.cs — this has to match it. */
export const DEMO_ACCOUNT = { email: 'admin@req2ticket.com', password: 'Passw0rd!' }
