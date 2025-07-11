/**
 * Utilidades para gestionar badges de productos
 */

/**
 * Obtiene la configuración de días mínimos para mostrar el badge "Nuevo"
 */
export async function getNewBadgeConfig(): Promise<number> {
  try {
    const response = await fetch('/api/admin/configuration')
    if (response.ok) {
      const data = await response.json()
      return data.data?.newBadgeDays || 30
    }
  } catch (error) {
    console.error('Error getting new badge config:', error)
  }
  return 30 // Default fallback
}

/**
 * Determina si un producto debe mostrar el badge "Nuevo"
 * basado en la fecha de Nieuwkoop (Sysmodified)
 */
export function isNewProduct(sysmodified: string | null, newBadgeDays: number = 30): boolean {
  if (!sysmodified) return false
  
  try {
    const modifiedDate = new Date(sysmodified)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysDiff <= newBadgeDays
  } catch (error) {
    console.error('Error parsing sysmodified date:', error)
    return false
  }
}

/**
 * Formatea la fecha de modificación para mostrar en el badge
 */
export function formatSysmodifiedDate(sysmodified: string | null): string {
  if (!sysmodified) return ''
  
  try {
    const date = new Date(sysmodified)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return ''
  }
}

/**
 * Calcula cuántos días hace que se modificó el producto
 */
export function getDaysAgo(sysmodified: string | null): number {
  if (!sysmodified) return 0
  
  try {
    const modifiedDate = new Date(sysmodified)
    const now = new Date()
    return Math.floor((now.getTime() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24))
  } catch (error) {
    return 0
  }
}