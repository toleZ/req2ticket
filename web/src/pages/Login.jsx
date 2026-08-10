import { LoginForm } from '@/components/auth/LoginForm'

async function handleLogin(values) {
  console.log('Login submitted:', values)
}

export function Login() {
  return <LoginForm onSubmit={handleLogin} />
}
