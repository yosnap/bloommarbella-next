import { useState, useEffect } from 'react'

interface StockData {
  sku: string
  stock: number
  price: number
  lastChecked: Date
  isRealTime: boolean
}

export function useRealtimeStock(sku: string) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStock = async () => {
    if (!sku) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/stock?sku=${sku}`)
      const data = await response.json()

      if (data.success) {
        setStockData(data.data)
      } else {
        setError(data.error || 'Error al obtener stock')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error fetching stock:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStock()
  }, [sku])

  return {
    stockData,
    loading,
    error,
    refetch: fetchStock
  }
}

export function useBulkStockUpdate() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStock = async (skus: string[]) => {
    setUpdating(true)
    setError(null)

    try {
      const response = await fetch('/api/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skus })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al actualizar stock')
      }

      return data.message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setUpdating(false)
    }
  }

  return {
    updateStock,
    updating,
    error
  }
}