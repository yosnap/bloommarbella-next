import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      take: 10
    })
    
    return NextResponse.json({ 
      success: true, 
      data: products,
      count: products.length 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener productos' 
    }, { status: 500 })
  }
}