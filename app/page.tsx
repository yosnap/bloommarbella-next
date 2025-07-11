'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layouts/header'
import { Logo } from '@/components/ui/logo'
import { LeafIcon, PlantPotIcon, GardenIcon, ServiceIcon } from '@/components/icons'
import { ArrowRight, Star, Truck, Shield, Clock, Heart, Award, Users, ChevronRight, Sparkles, Eye, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 gradient-hero">
          <div className="absolute inset-0 pattern-dots"></div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <LeafIcon className="w-32 h-32 text-bloom-primary" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: '3s' }}>
          <PlantPotIcon className="w-28 h-28 text-bloom-secondary" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className={`inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium mb-8 shadow-lg border border-bloom-primary/10 ${loaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <Heart className="w-4 h-4 mr-2 text-red-500 animate-pulse" />
              <span className="text-gray-700">Más de 1,000 clientes satisfechos en Marbella</span>
              <Sparkles className="w-4 h-4 ml-2 text-bloom-secondary" />
            </div>

            {/* Main heading */}
            <h1 className={`heading-1 text-bloom-primary mb-8 ${loaded ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              Transforma tu hogar con
              <span className="block text-gradient mt-2">la naturaleza</span>
            </h1>

            {/* Subheading */}
            <p className={`text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed ${loaded ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              Descubre nuestra exclusiva colección de plantas premium, macetas artesanales
              y servicios de diseño de jardines que transformarán tu espacio en un oasis verde.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center ${loaded ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <Link href="/catalogo" className="btn btn-primary btn-lg group">
                <ShoppingBag className="w-5 h-5 mr-3" />
                Explorar Catálogo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/servicios" className="btn btn-outline btn-lg">
                <Eye className="w-5 h-5 mr-3" />
                Nuestros Servicios
              </Link>
            </div>

            {/* Trust indicators */}
            <div className={`mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-600 ${loaded ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-bloom-primary" />
                <span>Garantía 6 meses</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-bloom-primary" />
                <span>Envío 24-48h</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-bloom-primary" />
                <span>Calidad Premium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-5 py-2 bg-bloom-primary/10 rounded-full text-bloom-primary font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              Excelencia Garantizada
            </div>
            <h2 className="heading-2 text-gray-900 mb-6">
              ¿Por qué elegir Bloom Marbella?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más de 10 años creando espacios verdes únicos en la Costa del Sol
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Star,
                title: 'Calidad Premium',
                description: 'Plantas seleccionadas de los mejores viveros europeos',
                color: 'bg-amber-100 text-amber-600',
                delay: '0s'
              },
              {
                icon: Truck,
                title: 'Entrega Rápida',
                description: 'Servicio de entrega en 24-48h en toda la Costa del Sol',
                color: 'bg-blue-100 text-blue-600',
                delay: '0.1s'
              },
              {
                icon: Shield,
                title: 'Garantía Total',
                description: 'Garantía de 6 meses en todas nuestras plantas',
                color: 'bg-green-100 text-green-600',
                delay: '0.2s'
              },
              {
                icon: Clock,
                title: 'Soporte 24/7',
                description: 'Asesoramiento experto cuando lo necesites',
                color: 'bg-purple-100 text-purple-600',
                delay: '0.3s'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group card card-hover p-8 text-center"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="heading-4 text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-5 py-2 bg-bloom-secondary/10 rounded-full text-bloom-secondary font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              Explora Nuestro Catálogo
            </div>
            <h2 className="heading-2 text-gray-900 mb-6">
              Encuentra lo que necesitas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde plantas de interior hasta servicios completos de diseño de jardines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: LeafIcon,
                title: 'Plantas',
                description: 'Interior y exterior',
                href: '/shop/plantas',
                gradient: 'from-emerald-500 to-green-600',
                pattern: 'pattern-dots',
                items: '250+ variedades'
              },
              {
                icon: PlantPotIcon,
                title: 'Macetas',
                description: 'Diseños únicos',
                href: '/shop/macetas',
                gradient: 'from-orange-500 to-amber-600',
                pattern: 'pattern-grid',
                items: '150+ modelos'
              },
              {
                icon: GardenIcon,
                title: 'Jardín',
                description: 'Herramientas y más',
                href: '/shop/jardin',
                gradient: 'from-lime-500 to-green-600',
                pattern: 'pattern-dots',
                items: '300+ productos'
              },
              {
                icon: ServiceIcon,
                title: 'Servicios',
                description: 'Diseño profesional',
                href: '/servicios',
                gradient: 'from-blue-500 to-indigo-600',
                pattern: 'pattern-grid',
                items: 'Personalizado'
              }
            ].map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group relative overflow-hidden rounded-3xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}>
                  <div className={`absolute inset-0 ${category.pattern}`}></div>
                </div>

                <div className="relative p-8 text-white text-center h-full flex flex-col justify-between min-h-[320px]">
                  <div>
                    <category.icon className="w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="heading-3 mb-2">{category.title}</h3>
                    <p className="text-white/90 mb-4">{category.description}</p>
                  </div>

                  <div>
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                      {category.items}
                    </span>

                    <div className="flex items-center justify-center text-white font-medium group-hover:gap-3 transition-all duration-300">
                      <span>Explorar</span>
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary">
          <div className="absolute inset-0 pattern-grid opacity-10"></div>
        </div>

        <div className="container relative text-center text-white">
          <h2 className="heading-2 mb-6">
            ¿Listo para transformar tu espacio?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Únete a más de 1,000 clientes satisfechos en Marbella y alrededores.
            Comienza tu proyecto verde hoy mismo con asesoramiento personalizado.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contacto" className="btn btn-secondary btn-lg">
              <Heart className="w-5 h-5 mr-3" />
              Consulta Gratuita
            </Link>
            <Link href="/proyectos" className="btn btn-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white hover:text-bloom-primary">
              Ver Proyectos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="mb-6">
                <Logo size="lg" textClassName="text-white" />
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transformando espacios en oasis verdes desde 2014.
                Tu partner de confianza en jardinería premium.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shop" className="hover:text-white transition-colors">Catálogo</Link></li>
                <li><Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link></li>
                <li><Link href="/proyectos" className="hover:text-white transition-colors">Proyectos</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Categorías</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shop/plantas" className="hover:text-white transition-colors">Plantas</Link></li>
                <li><Link href="/shop/macetas" className="hover:text-white transition-colors">Macetas</Link></li>
                <li><Link href="/shop/jardin" className="hover:text-white transition-colors">Jardín</Link></li>
                <li><Link href="/shop/ofertas" className="hover:text-white transition-colors">Ofertas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Lun-Sáb: 9:00 - 20:00
                </li>
                <li>📍 Av. Ricardo Soriano 72, Marbella</li>
                <li>📧 info@bloommarbella.es</li>
                <li>📱 +34 952 123 456</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Bloom Marbella. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
