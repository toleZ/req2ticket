import { useNavigate } from 'react-router-dom'

import { LoginForm } from '@/components/auth/LoginForm/LoginForm'
import { login } from '@/lib/api/auth'
import { saveSession } from '@/lib/auth'
import { queryClient } from '@/lib/queries/queryClient'

export function Login() {
  const navigate = useNavigate()

  async function handleLogin(values) {
    // If the credentials do not match, login() throws and LoginForm shows the message.
    const session = await login(values)

    // The API returns { token, expiresAt, user }; the checkbox decides where it is stored.
    saveSession(session, values.remember)

    // Nothing cached may belong to whoever was here before.
    queryClient.clear()

    // "/" opens the last project used, or the first one, or the "no projects yet" screen.
    navigate('/')
  }

  return <LoginForm onSubmit={handleLogin} />
}
