/* Every key here has to match the field's `name` in the form exactly: handleChange uses
   `e.target.name` to know what to update. If they do not match, the field silently stops
   accepting input and nothing raises an error. */
export const INITIAL_VALUES = { email: '', password: '', remember: false }

/* DEMO — borrar antes de prod.
   The demo accounts the DemoSeeder creates (api/src/Infrastructure/Seeding/DemoSeeder.cs), one
   per role in the R2T project. They all share the password set in Seed:DemoPassword; this one
   is the local default. developer@ is also Scrum Master in DEMO, to show the role belongs to
   the project. The buttons only fill the form: entering is still "Entrar". */
export const DEMO_PASSWORD = 'Passw0rd!'

export const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@req2ticket.com' },
  { label: 'Product Owner', email: 'productowner@req2ticket.com' },
  { label: 'Scrum Master', email: 'scrummaster@req2ticket.com' },
  { label: 'Developer', email: 'developer@req2ticket.com' },
  { label: 'QA', email: 'qa@req2ticket.com' },
  { label: 'Lector', email: 'viewer@req2ticket.com' },
  { label: 'SuperAdmin', email: 'superadmin@req2ticket.com' },
]
