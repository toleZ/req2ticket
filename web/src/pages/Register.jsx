import { useNavigate } from 'react-router-dom'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { register } from '@/lib/api'
import { saveSession } from '@/lib/auth'

export function Register() {
  const navigate = useNavigate()

  async function handleRegister(values) {
    // Si el email ya existe, register() tira y RegisterForm muestra el mensaje.
    const session = await register(values)

    // Igual que el login: la API devuelve { token, expiresAt, user } y deja logueado.
    saveSession(session, false)

    navigate('/')
  }

  return <RegisterForm onSubmit={handleRegister} />
}
