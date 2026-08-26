import { useNavigate } from 'react-router-dom'

import { LoginForm } from '@/components/auth/LoginForm'
import { login } from '@/lib/api'
import { saveSession } from '@/lib/auth'

export function Login() {
  const navigate = useNavigate()

  async function handleLogin(values) {
    // If the credentials do not match, login() throws and LoginForm shows the message.
    const session = await login(values)

    // The API returns { token, expiresAt, user }; the checkbox decides where it is stored.
    saveSession(session, values.remember)

    navigate('/')
  }

  return <LoginForm onSubmit={handleLogin} />
}
