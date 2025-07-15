'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'register'
}

function AuthFormContent({ mode }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  // Get the callback URL from query params, default to /cuenta
  const callbackUrl = searchParams.get('callbackUrl') || '/cuenta'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'register') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden')
          setIsLoading(false)
          return
        }

        // Register user
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Error al registrar usuario')
        }

        // Auto login after registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        router.push(callbackUrl)
      } else {
        // Login
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          throw new Error('Email o contraseña incorrectos')
        }

        router.push(callbackUrl)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Logo size="xl" />
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <div className="mb-8">
            <h2 className="text-center text-3xl font-cormorant font-light text-gray-900">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <Link href="/auth/registro" className="font-medium text-bloom-primary hover:text-bloom-secondary transition-colors">
                    Regístrate aquí
                  </Link>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/auth/login" className="font-medium text-bloom-primary hover:text-bloom-secondary transition-colors">
                    Inicia sesión
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={mode === 'register'}
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent transition-all"
                    placeholder="Juan García"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-bloom-primary focus:ring-bloom-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/recuperar" className="font-medium text-bloom-primary hover:text-bloom-secondary transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-bloom-primary hover:bg-bloom-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bloom-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
                  </>
                ) : (
                  <>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</>
                )}
              </button>
            </div>
          </form>

          {mode === 'register' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">¿Eres un profesional?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/registro-asociado"
                  className="inline-flex items-center px-4 py-2 border-2 border-bloom-primary text-sm font-medium rounded-lg text-bloom-primary hover:bg-bloom-primary hover:text-white transition-all"
                >
                  Regístrate como Asociado
                </Link>
                <p className="mt-2 text-xs text-gray-600">
                  Obtén un 20% de descuento en todos los productos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AuthForm({ mode }: AuthFormProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Logo size="xl" />
          </div>
          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bloom-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthFormContent mode={mode} />
    </Suspense>
  )
}