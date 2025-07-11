'use client'

import { useState, useEffect } from 'react'
import { X, Percent, Crown, Gift, Star } from 'lucide-react'

interface SlidingBannerProps {
  isAssociate: boolean
  onClose?: () => void
}

export function SlidingBanner({ isAssociate, onClose }: SlidingBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const messages = [
    {
      icon: <Percent className="h-4 w-4" />,
      text: "¡Descuento Asociado Activo! 20% OFF en todos los productos"
    },
    {
      icon: <Crown className="h-4 w-4" />,
      text: "Precios exclusivos para asociados - Ahorra en cada compra"
    },
    {
      icon: <Gift className="h-4 w-4" />,
      text: "Acceso anticipado a nuevos productos y ofertas especiales"
    },
    {
      icon: <Star className="h-4 w-4" />,
      text: "Miembro VIP - Disfruta de beneficios exclusivos"
    }
  ]

  useEffect(() => {
    if (!isAssociate || !isVisible) return

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
    }, 4000) // Cambiar mensaje cada 4 segundos

    return () => clearInterval(interval)
  }, [isAssociate, isVisible, messages.length])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  if (!isAssociate || !isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-[#f0a04b] to-orange-500 text-white relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat animate-slide-bg" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="container mx-auto px-4 py-2 relative">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse">
              {messages[currentMessageIndex].icon}
            </div>
            <span className="font-medium text-sm md:text-base animate-fade-in-up">
              {messages[currentMessageIndex].text}
            </span>
          </div>
          
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
            aria-label="Cerrar banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}