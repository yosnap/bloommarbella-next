import { AssociateForm } from '@/components/auth/associate-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registro de Asociado - Bloom Marbella',
  description: 'Regístrate como asociado profesional y obtén un 20% de descuento en todos nuestros productos',
}

export default function AssociateRegisterPage() {
  return <AssociateForm />
}