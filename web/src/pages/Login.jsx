import { useNavigate } from 'react-router-dom'

import { LoginForm } from '@/components/auth/LoginForm'
import { login } from '@/lib/api'
import { saveSession } from '@/lib/auth'

export function Login() {
  const navigate = useNavigate()

  async function handleLogin(values) {
    // Si las credenciales no coinciden, login() tira y LoginForm muestra el mensaje.
    const session = await login(values)

    // La API devuelve { token, expiresAt, user }; el check decide dónde se guarda.
    saveSession(session, values.remember)

    navigate('/')
  }

  return <LoginForm onSubmit={handleLogin} />
}
