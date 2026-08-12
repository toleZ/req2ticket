import { useNavigate } from 'react-router-dom'

import { LoginForm } from '@/components/auth/LoginForm'
import { login } from '@/lib/api'

export function Login() {
  const navigate = useNavigate()

  async function handleLogin(values) {
    // Si las credenciales no coinciden, login() tira y LoginForm muestra el mensaje.
    await login(values)
    navigate('/')
  }

  return <LoginForm onSubmit={handleLogin} />
}
