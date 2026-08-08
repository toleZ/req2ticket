import { RegisterForm } from '@/components/auth/RegisterForm'
import './App.css'

// No backend in this repo yet — stands in for the real request.
async function registerUser(values) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  console.log('register', values)
}

function App() {
  return (
    <main className="app">
      <RegisterForm onSubmit={registerUser} />
    </main>
  )
}

export default App
