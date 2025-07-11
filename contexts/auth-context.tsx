'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

interface AuthContextType {
  user: {
    id: string
    email: string
    name?: string | null
    role: UserRole
  } | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isAssociate: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    isAssociate: false,
  })

  useEffect(() => {
    if (status === 'loading') {
      setAuthState(prev => ({ ...prev, isLoading: true }))
    } else if (status === 'authenticated' && session?.user) {
      setAuthState({
        user: session.user,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: session.user.role === 'ADMIN',
        isAssociate: session.user.role === 'ASSOCIATE',
      })
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        isAssociate: false,
      })
    }
  }, [session, status])

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}