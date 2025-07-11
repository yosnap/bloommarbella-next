'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePricing } from '@/contexts/pricing-context'

export function useUserPricing() {
  const { data: session } = useSession()
  const { showVatForAssociate, toggleVatDisplay, setIsAssociate } = usePricing()
  
  const isAssociate = session?.user?.role === 'ASSOCIATE'
  
  // Actualizar el contexto cuando cambie la sesión
  useEffect(() => {
    setIsAssociate(isAssociate)
  }, [isAssociate, setIsAssociate])
  
  return {
    userRole: session?.user?.role || 'CUSTOMER',
    isAssociate,
    showVatForAssociate,
    toggleVatDisplay
  }
}