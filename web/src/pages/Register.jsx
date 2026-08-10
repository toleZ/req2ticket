import { RegisterForm } from '@/components/auth/RegisterForm'

async function requestAccess(values) {
  await new Promise((resolve) => setTimeout(resolve, 600))

  console.log('access request', values)
}

export function Register() {
  return <RegisterForm onSubmit={requestAccess} />
}
