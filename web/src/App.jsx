import { LoginForm } from '@/components/auth/LoginForm'

async function handleLogin(values) {
  // No backend yet — this is where a src/api/ call will go once one exists.
  console.log('Login submitted:', values)
}

function App() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-4">
      <div className="w-full max-w-sm rounded-card bg-elevated p-6 shadow-card surface-highlight ring-[0.5px] ring-separator">
        <h1 className="text-title2 text-label">Iniciar sesión</h1>
        <p className="mb-6 text-footnote text-label-secondary">
          Ingresá tu email y contraseña para continuar.
        </p>
        <LoginForm onSubmit={handleLogin} />
      </div>
    </main>
  )
}

export default App
