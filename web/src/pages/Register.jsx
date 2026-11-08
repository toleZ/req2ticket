import { useNavigate } from 'react-router-dom'

import { RegisterForm } from '@/components/auth/RegisterForm/RegisterForm'
import { register } from '@/lib/api/auth'
import { saveSession } from '@/lib/auth'
import { queryClient } from '@/lib/queries/queryClient'

export function Register() {
  const navigate = useNavigate()

  async function handleRegister(values) {
    // If the email already exists, register() throws and RegisterForm shows the message.
    const session = await register(values)

    // Same as the login: the API returns { token, expiresAt, user } and leaves you logged in.
    saveSession(session, false)
    queryClient.clear()

    // A new account has no projects: "/" shows how to create one.
    navigate('/')
  }

  return <RegisterForm onSubmit={handleRegister} />
}
