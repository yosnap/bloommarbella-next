'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface BloomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  children: React.ReactNode
}

const BloomButton = React.forwardRef<HTMLButtonElement, BloomButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
      setIsMounted(true)
    }, [])

    const getStyles = () => {
      const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      
      const sizeStyles = {
        sm: "h-9 rounded-md px-3",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8"
      }

      let variantStyles = ""
      let dynamicStyles: React.CSSProperties = {}

      switch (variant) {
        case 'primary':
          variantStyles = "text-white"
          dynamicStyles = {
            backgroundColor: (isMounted && isHovered) ? '#0f2412' : '#183a1d'
          }
          break
        case 'secondary':
          variantStyles = "text-white"
          dynamicStyles = {
            backgroundColor: (isMounted && isHovered) ? '#d68a35' : '#f0a04b'
          }
          break
        case 'outline':
          variantStyles = "border transition-colors"
          dynamicStyles = {
            borderColor: '#183a1d',
            color: (isMounted && isHovered) ? 'white' : '#183a1d',
            backgroundColor: (isMounted && isHovered) ? '#183a1d' : 'transparent'
          }
          break
      }

      return {
        className: cn(baseStyles, sizeStyles[size], variantStyles, className),
        style: dynamicStyles
      }
    }

    const styles = getStyles()

    return (
      <button
        ref={ref}
        className={styles.className}
        style={styles.style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

BloomButton.displayName = "BloomButton"

export { BloomButton }