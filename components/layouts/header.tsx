'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { usePricing } from '@/contexts/pricing-context'
import { useFavorites } from '@/contexts/favorites-context'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { SlidingBanner } from '@/components/ui/sliding-banner'
import { 
  LeafIcon, 
  PlantPotIcon, 
  GardenIcon, 
  TreeIcon, 
  FlowerIcon, 
  ServiceIcon 
} from '@/components/icons'
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  ChevronDown,
  Home,
  Phone,
  Mail,
  Calculator,
  Heart
} from 'lucide-react'

const navigation = [
  {
    name: 'Catálogo',
    href: '/catalogo',
    icon: null,
    featured: true
  },
  {
    name: 'Plantas',
    href: '/catalogo?categories=Planten',
    icon: LeafIcon,
    featured: true,
    children: [
      {
        name: 'Hidrocultivos',
        href: '/catalogo?categories=Hydroculture',
        icon: PlantPotIcon,
        description: 'Plantas en sistemas hidropónicos'
      },
      {
        name: 'Cultivo en Tierra',
        href: '/catalogo?categories=Soilculture',
        icon: TreeIcon,
        description: 'Plantas tradicionales en sustrato'
      },
      {
        name: 'Plantas Artificiales',
        href: '/catalogo?categories=Artificial%20',
        icon: FlowerIcon,
        description: 'Belleza sin mantenimiento'
      }
    ]
  },
  {
    name: 'Jardineras',
    href: '/catalogo?categories=Jardineras',
    icon: PlantPotIcon,
    children: [
      {
        name: 'Equipos y Accesorios',
        href: '/catalogo?categories=Equipments%20and%20accessories',
        description: 'Herramientas y accesorios para jardinería'
      },
      {
        name: 'Decoración',
        href: '/catalogo?categories=Decoration',
        description: 'Elementos decorativos para jardín'
      },
      {
        name: 'Paredes Verdes',
        href: '/catalogo?categories=Green%20walls',
        description: 'Sistemas de jardines verticales'
      },
      {
        name: 'Conceptos Todo en Uno',
        href: '/catalogo?categories=All-in-1%20concepts',
        description: 'Soluciones completas de plantas y macetas'
      }
    ]
  },
  {
    name: 'Jardín',
    href: '/shop/jardin',
    icon: GardenIcon,
    children: [
      {
        name: 'Herramientas',
        href: '/shop/jardin/herramientas',
        description: 'Todo lo que necesitas'
      },
      {
        name: 'Fertilizantes',
        href: '/shop/jardin/fertilizantes',
        description: 'Nutrición para tus plantas'
      },
      {
        name: 'Sistemas de Riego',
        href: '/shop/jardin/riego',
        description: 'Automatiza el cuidado'
      }
    ]
  },
  {
    name: 'Servicios',
    href: '/servicios',
    icon: ServiceIcon,
    children: [
      {
        name: 'Diseño de Jardines',
        href: '/servicios/diseno',
        description: 'Espacios únicos y personalizados'
      },
      {
        name: 'Mantenimiento',
        href: '/servicios/mantenimiento',
        description: 'Cuidado profesional'
      },
      {
        name: 'Instalación',
        href: '/servicios/instalacion',
        description: 'Montaje profesional'
      }
    ]
  },
  {
    name: 'Blog',
    href: '/blog',
    icon: null
  }
]

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, isAssociate } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [associateDiscount, setAssociateDiscount] = useState(20)
  const { showVatForAssociate, toggleVatDisplay, setIsAssociate } = usePricing()
  const { favoritesCount } = useFavorites()
  
  
  // Actualizar el estado del contexto cuando cambie el usuario
  useEffect(() => {
    setIsAssociate(isAssociate)
  }, [isAssociate, setIsAssociate])

  // Obtener descuento de asociados de la configuración
  useEffect(() => {
    const fetchAssociateDiscount = async () => {
      try {
        const response = await fetch('/api/admin/configuration')
        if (response.ok) {
          const data = await response.json()
          setAssociateDiscount(data.data?.associateDiscount || 20)
        }
      } catch (error) {
        console.error('Error fetching associate discount:', error)
      }
    }
    fetchAssociateDiscount()
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      {/* Sliding Banner for Associates */}
      {isAssociate && showBanner && (
        <SlidingBanner 
          isAssociate={isAssociate}
          onClose={() => setShowBanner(false)}
        />
      )}
      
      {/* Top Bar */}
      <div className="bg-bloom-primary text-white py-2">
        <div className="container flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              +34 952 123 456
            </span>
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              info@bloommarbella.es
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/asociados" 
              className="text-white hover:text-bloom-secondary transition-colors"
            >
              Área Asociados
            </Link>
            {/* <span>|</span>
            <Link 
              href="/admin" 
              className="text-white hover:text-bloom-secondary transition-colors"
            >
              Admin
            </Link> */}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Logo size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center space-x-1 transition-colors font-medium hover:text-bloom-primary ${
                    item.featured ? 'text-bloom-primary' : 'text-gray-700'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                  {item.children && <ChevronDown className="h-4 w-4" />}
                </Link>

                {/* Dropdown Menu */}
                {item.children && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-6 z-50">
                    <div className="grid gap-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {'icon' in child && child.icon && (
                            <child.icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-800" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{child.name}</h4>
                            {child.description && (
                              <p className="text-sm text-gray-600 mt-1">{child.description}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-bloom-primary transition-colors"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Favorites */}
            <Link href="/cuenta/favoritos">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-bloom-primary transition-colors relative"
              >
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Account */}
            <div className="relative user-menu-container">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-bloom-primary transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="h-5 w-5" />
              </Button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {isAssociate && (
                          <span className="inline-block mt-1 text-xs px-2 py-1 bg-bloom-secondary/10 text-bloom-secondary rounded-full">
                            Asociado -{associateDiscount}%
                          </span>
                        )}
                      </div>
                      <Link
                        href="/cuenta"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Mi Cuenta
                      </Link>
                      <Link
                        href="/cuenta/pedidos"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Mis Pedidos
                      </Link>
                      {isAssociate && (
                        <div className="px-4 py-2 border-t border-gray-200">
                          <button
                            onClick={toggleVatDisplay}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 w-full text-left"
                          >
                            <Calculator className="h-4 w-4" />
                            <span>Mostrar precios {showVatForAssociate ? 'sin' : 'con'} IVA</span>
                          </button>
                        </div>
                      )}
                      {/* {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Panel Admin
                        </Link>
                      )} */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/auth/registro"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Crear Cuenta
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-bloom-primary transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-bloom-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="container py-4">
            <nav className="space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-700 hover:text-bloom-primary transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                  {item.children && (
                    <div className="ml-6 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block text-sm text-gray-600 hover:text-bloom-primary transition-colors py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}