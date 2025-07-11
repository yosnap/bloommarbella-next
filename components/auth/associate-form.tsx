'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { 
  Upload, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Building, 
  Phone,
  MapPin,
  Mail,
  User,
  Lock,
  CheckCircle
} from 'lucide-react'

const documentTypes = [
  { value: 'COMPANY_CERTIFICATE', label: 'Certificado de Empresa', description: 'Documento oficial de registro de empresa' },
  { value: 'SOCIAL_SECURITY', label: 'Alta en Seguridad Social', description: 'Documento de alta en la Seguridad Social' },
  { value: 'FREELANCE_REGISTER', label: 'Alta como Autónomo', description: 'Documento de alta como trabajador autónomo' },
]

export function AssociateForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Account info, 2: Company info, 3: Document upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    // Account info
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    
    // Company info
    companyName: '',
    taxId: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    
    // Document
    documentType: 'COMPANY_CERTIFICATE',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos PDF, JPG o PNG')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no puede superar los 5MB')
        return
      }
      
      setUploadedFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step < 3) {
      // Validate current step
      if (step === 1) {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden')
          return
        }
        if (formData.password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres')
          return
        }
      }
      
      setStep(step + 1)
      return
    }

    // Final submission
    if (!uploadedFile) {
      setError('Por favor, sube el documento requerido')
      return
    }

    setIsLoading(true)

    try {
      // Create form data for file upload
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })
      formDataToSend.append('document', uploadedFile)

      const res = await fetch('/api/auth/register-associate', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al enviar la solicitud')
      }

      // Redirect to success page
      router.push('/auth/registro-asociado/exito')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="xl" />
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-center text-3xl font-cormorant font-light text-gray-900">
              Registro de Asociado Profesional
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Obtén un 20% de descuento en todos nuestros productos
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      step >= i
                        ? 'bg-bloom-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-20 h-1 ml-2 ${
                        step > i ? 'bg-bloom-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Cuenta</span>
              <span className="ml-8">Empresa</span>
              <span>Documentación</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Account Information */}
            {step === 1 && (
              <>
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
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="Juan García Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email profesional
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
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="tu@empresa.com"
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
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                </div>

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
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Company Information */}
            {step === 2 && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la empresa
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="Jardinería García S.L."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                    CIF/NIF
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="taxId"
                      name="taxId"
                      type="text"
                      required
                      value={formData.taxId}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="B12345678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de contacto
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="+34 600 123 456"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="Calle Principal 123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="Marbella"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                      placeholder="29600"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <>
                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de documento
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bloom-primary focus:border-transparent"
                  >
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    {documentTypes.find(t => t.value === formData.documentType)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir documento
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-bloom-primary transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-bloom-primary hover:text-bloom-secondary"
                        >
                          <span>Sube un archivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, JPG o PNG hasta 5MB
                      </p>
                    </div>
                  </div>
                  {uploadedFile && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">{uploadedFile.name}</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Información importante:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Tu solicitud será revisada en un plazo de 24-48 horas</li>
                    <li>• Recibirás un email con el resultado de la verificación</li>
                    <li>• Una vez aprobado, el descuento del 20% se aplicará automáticamente</li>
                    <li>• Los documentos se procesan de forma segura y confidencial</li>
                  </ul>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-bloom-primary hover:bg-bloom-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bloom-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando solicitud...
                  </>
                ) : (
                  <>{step < 3 ? 'Siguiente' : 'Enviar Solicitud'}</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="font-medium text-bloom-primary hover:text-bloom-secondary">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}