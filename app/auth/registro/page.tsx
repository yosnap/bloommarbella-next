import { AuthForm } from '@/components/auth/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Cuenta - Bloom Marbella',
  description: 'Crea tu cuenta en Bloom Marbella y disfruta de beneficios exclusivos',
}

export default function RegisterPage() {
  return <AuthForm mode="register" />
}