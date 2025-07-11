'use client'

import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/layouts/header'
import { ArrowLeft, User, Mail, Phone, Calendar, Save } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function PerfilPage() {
  const { user, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    birthday: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar actualización de perfil
    console.log('Actualizando perfil:', formData)
    alert('Funcionalidad en desarrollo')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bloom-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/cuenta" 
              className="inline-flex items-center text-bloom-primary hover:text-bloom-primary/80 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Mi Cuenta
            </Link>
            <h1 className="text-3xl font-cormorant font-medium text-gray-900">
              Mi Perfil
            </h1>
            <p className="text-gray-600 mt-2">
              Actualiza tu información personal
            </p>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                    placeholder="tu@email.com"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El email no se puede cambiar
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                    placeholder="+34 123 456 789"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 bg-bloom-primary text-white rounded-lg font-medium hover:bg-bloom-primary/90 transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}