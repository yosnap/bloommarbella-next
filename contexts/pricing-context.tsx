'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface PricingContextType {
  showVatForAssociate: boolean
  toggleVatDisplay: () => void
  isAssociate: boolean
  setIsAssociate: (isAssociate: boolean) => void
}

const PricingContext = createContext<PricingContextType | undefined>(undefined)

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [showVatForAssociate, setShowVatForAssociate] = useState(false)
  const [isAssociate, setIsAssociate] = useState(false)

  // Cargar preferencia del localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('showVatForAssociate')
    if (savedPreference === 'true') {
      setShowVatForAssociate(true)
    }
  }, [])

  // Guardar preferencia en localStorage
  useEffect(() => {
    localStorage.setItem('showVatForAssociate', showVatForAssociate.toString())
  }, [showVatForAssociate])

  const toggleVatDisplay = () => {
    setShowVatForAssociate(!showVatForAssociate)
  }

  return (
    <PricingContext.Provider value={{
      showVatForAssociate,
      toggleVatDisplay,
      isAssociate,
      setIsAssociate
    }}>
      {children}
    </PricingContext.Provider>
  )
}

export function usePricing() {
  const context = useContext(PricingContext)
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider')
  }
  return context
}