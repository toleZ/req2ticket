import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

const MODES = [
  { id: 'login', label: 'Iniciar sesión' },
  { id: 'register', label: 'Crear cuenta' },
]

const TAB_CLASSES = 'flex-1 rounded-control px-3 py-2 text-body font-medium transition-colors'

async function handleLogin(values) {
  // No backend yet — this is where a src/api/ call will go once one exists.
  console.log('Login submitted:', values)
}

async function registerUser(values) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  console.log('register', values)
}

function App() {
  const [mode, setMode] = useState('login')

  return (
    <main className="grid min-h-screen place-items-center bg-base px-4">
      <section className="w-full max-w-sm rounded-card bg-elevated p-6 shadow-card surface-highlight ring-[0.5px] ring-separator">
        <div className="mb-6 flex gap-1 rounded-control bg-fill-tertiary p-1" aria-label="Modo de acceso">
          {MODES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={`${TAB_CLASSES} ${
                mode === id ? 'bg-elevated text-label shadow-card' : 'text-label-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === 'login' ? (
          <LoginForm onSubmit={handleLogin} />
        ) : (
          <RegisterForm onSubmit={registerUser} />
        )}
      </section>
    </main>
  )
}

export default App
