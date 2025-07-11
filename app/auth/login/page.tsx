import { AuthForm } from '@/components/auth/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Bloom Marbella',
  description: 'Accede a tu cuenta de Bloom Marbella',
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}