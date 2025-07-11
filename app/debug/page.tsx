'use client'

import { useAuth } from '@/contexts/auth-context'
import { usePricing } from '@/contexts/pricing-context'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layouts/header'
import { useState } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const { user, isLoading, isAuthenticated, isAdmin, isAssociate } = useAuth()
  const { showVatForAssociate, isAssociate: pricingIsAssociate } = usePricing()
  const [updateResult, setUpdateResult] = useState<any>(null)

  const updateUserRole = async (role: string) => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/debug/check-user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          role
        })
      })
      
      const result = await response.json()
      setUpdateResult(result)
    } catch (error) {
      console.error('Error updating role:', error)
      setUpdateResult({ error: 'Failed to update role' })
    }
  }

  const approveAssociateRequest = async () => {
    if (!user?.email) return

    try {
      // First, find the associate request
      const response = await fetch('/api/admin/associate-requests')
      const data = await response.json()
      
      const userRequest = data.requests?.find((req: any) => req.user.email === user.email && req.status === 'PENDING')
      
      if (!userRequest) {
        setUpdateResult({ error: 'No pending associate request found' })
        return
      }

      // Approve the request
      const approveResponse = await fetch('/api/admin/associate-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: userRequest.id,
          action: 'APPROVE'
        })
      })

      const approveResult = await approveResponse.json()
      setUpdateResult(approveResult)
    } catch (error) {
      console.error('Error approving request:', error)
      setUpdateResult({ error: 'Failed to approve request' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
          
          <div className="grid gap-6">
            {/* Session Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify({ session, status }, null, 2)}
              </pre>
            </div>

            {/* Auth Context Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Auth Context</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify({ 
                  user, 
                  isLoading, 
                  isAuthenticated, 
                  isAdmin, 
                  isAssociate 
                }, null, 2)}
              </pre>
            </div>

            {/* Pricing Context Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Pricing Context</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify({ 
                  showVatForAssociate, 
                  pricingIsAssociate 
                }, null, 2)}
              </pre>
            </div>

            {/* User Role Update */}
            {user?.email && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Update User Role</h2>
                <p className="mb-4">Current user: {user.email}</p>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => updateUserRole('CUSTOMER')}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Set as CUSTOMER
                  </button>
                  <button
                    onClick={() => updateUserRole('ASSOCIATE')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Set as ASSOCIATE
                  </button>
                  <button
                    onClick={() => updateUserRole('ADMIN')}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Set as ADMIN
                  </button>
                </div>
                <div className="mb-4">
                  <button
                    onClick={approveAssociateRequest}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve My Associate Request
                  </button>
                </div>
                {updateResult && (
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(updateResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}