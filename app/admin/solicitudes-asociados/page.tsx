'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { useAuth } from '@/contexts/auth-context'
import { Users, Clock, CheckCircle, XCircle, Calendar, Mail, Phone, MapPin, Building, FileText } from 'lucide-react'

interface AssociateRequest {
  id: string
  companyName: string
  taxId: string
  phone: string
  address: string
  city: string
  postalCode: string
  documentType: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }
}

export default function SolicitudesAsociadosPage() {
  const { isAdmin } = useAuth()
  const [requests, setRequests] = useState<AssociateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchRequests()
    }
  }, [isAdmin])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/associate-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId)
      const response = await fetch('/api/admin/associate-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          action: 'APPROVE'
        })
      })

      if (response.ok) {
        await fetchRequests()
        alert('Solicitud aprobada exitosamente')
      } else {
        const error = await response.json()
        alert(error.message || 'Error al aprobar la solicitud')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error al aprobar la solicitud')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId)
      const response = await fetch('/api/admin/associate-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          action: 'REJECT',
          rejectionReason
        })
      })

      if (response.ok) {
        await fetchRequests()
        setShowRejectionModal(null)
        setRejectionReason('')
        alert('Solicitud rechazada')
      } else {
        const error = await response.json()
        alert(error.message || 'Error al rechazar la solicitud')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Error al rechazar la solicitud')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'APPROVED': return 'Aprobada'
      case 'REJECTED': return 'Rechazada'
      default: return status
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitudes de Asociados</h1>
            <p className="text-gray-600">Gestiona las solicitudes de registro como asociado</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.companyName}</h3>
                        <p className="text-sm text-gray-600">{request.user.email}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-2">{getStatusText(request.status)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>CIF/NIF: {request.taxId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{request.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{request.user.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{request.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{request.city}, {request.postalCode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Solicitado: {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {request.status === 'REJECTED' && request.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-red-800">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Motivo del rechazo:</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{request.rejectionReason}</p>
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowRejectionModal(request.id)}
                        disabled={processing === request.id}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                      >
                        {processing === request.id ? 'Procesando...' : 'Rechazar'}
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processing === request.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {processing === request.id ? 'Procesando...' : 'Aprobar'}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {requests.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
                  <p className="text-gray-600">No hay solicitudes de asociados pendientes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rechazar Solicitud</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo (opcional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Explica brevemente el motivo del rechazo..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectionModal(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(showRejectionModal)}
                disabled={processing === showRejectionModal}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processing === showRejectionModal ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}