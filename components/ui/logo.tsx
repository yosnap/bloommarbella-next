'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LeafIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

export function Logo({ 
  size = 'md', 
  showText = true, 
  className,
  textClassName 
}: LogoProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className={cn(
        'relative overflow-hidden rounded-xl bg-bloom-primary flex items-center justify-center',
        sizeClasses[size]
      )}>
        {!imageError ? (
          <Image
            src="/images/bloom-logo.png"
            alt="Bloom Marbella Logo"
            width={64}
            height={64}
            className="object-contain p-1"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <LeafIcon className={cn(
            'text-white',
            size === 'sm' ? 'w-5 h-5' :
            size === 'md' ? 'w-6 h-6' :
            size === 'lg' ? 'w-7 h-7' :
            'w-8 h-8'
          )} />
        )}
      </div>
      
      {showText && (
        <div className="text-left">
          <h1 className={cn(
            'font-cormorant font-medium text-bloom-primary leading-tight',
            textSizeClasses[size],
            textClassName
          )}>
            Bloom Marbella
          </h1>
          <p className={cn(
            'text-gray-600 font-sans leading-tight',
            size === 'sm' ? 'text-xs' :
            size === 'md' ? 'text-sm' :
            size === 'lg' ? 'text-sm' :
            'text-base'
          )}>
            Premium Garden Design
          </p>
        </div>
      )}
    </div>
  )
}